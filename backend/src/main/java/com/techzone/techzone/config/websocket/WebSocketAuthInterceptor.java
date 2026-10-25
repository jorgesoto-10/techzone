package com.techzone.techzone.config.websocket;

import com.techzone.techzone.config.jwt.JwtUtil;
import com.techzone.techzone.repository.UsuarioRepository;
import com.techzone.techzone.repository.UsuarioRolRepository;
import io.jsonwebtoken.JwtException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageType;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
public class WebSocketAuthInterceptor implements ChannelInterceptor {

  private final JwtUtil jwt;
  private final UsuarioRepository usuarios;
  private final UsuarioRolRepository roles;

  private final Map<String, Sesion> sesiones =
    new ConcurrentHashMap<>();

  private record Sesion(Long usuarioId, String token) {}

  public WebSocketAuthInterceptor(
    JwtUtil jwt,
    UsuarioRepository usuarios,
    UsuarioRolRepository roles
  ) {
    this.jwt = jwt;
    this.usuarios = usuarios;
    this.roles = roles;
  }

  private Long validarAdministrador(String token) {
    Long id;

    try {
      id = jwt.usuario(token);
    } catch (JwtException | IllegalArgumentException e) {
      throw new BadCredentialsException(
        "Token inválido o vencido"
      );
    }

    var usuario = usuarios.findById(id);

    if (usuario.isEmpty() || !usuario.get().isActivo()) {
      throw new BadCredentialsException(
        "Cuenta no disponible"
      );
    }

    if (
      !roles.existsByUsuario_IdUsuarioAndRol_Nombre(
        id,
        "ADMIN"
      )
    ) {
      throw new AccessDeniedException(
        "Solo administradores pueden recibir notificaciones"
      );
    }

    return id;
  }

  @Override
  public Message<?> preSend(
    Message<?> message,
    MessageChannel channel
  ) {
    StompHeaderAccessor accessor =
      MessageHeaderAccessor.getAccessor(
        message,
        StompHeaderAccessor.class
      );

    if (accessor == null) {
      throw new AccessDeniedException(
        "Mensaje STOMP inválido"
      );
    }

    StompCommand comando = accessor.getCommand();

    // Los latidos no contienen una operación STOMP.
    if (comando == null) {
      return message;
    }

    // Permitir liberar suscripciones y cerrar conexiones.
    if (
      comando == StompCommand.DISCONNECT ||
      comando == StompCommand.UNSUBSCRIBE
    ) {
      return message;
    }

    String sessionId = accessor.getSessionId();

    if (sessionId == null) {
      throw new AccessDeniedException(
        "Sesión WebSocket no disponible"
      );
    }

    // Autenticación inicial mediante el JWT existente.
    if (comando == StompCommand.CONNECT) {
      String header =
        accessor.getFirstNativeHeader("Authorization");

      if (
        header == null ||
        !header.startsWith("Bearer ")
      ) {
        throw new BadCredentialsException(
          "Inicia sesión para conectar las notificaciones"
        );
      }

      String token = header.substring(7).trim();
      Long id = validarAdministrador(token);

      accessor.setUser(
        new UsernamePasswordAuthenticationToken(
          id.toString(),
          null,
          List.of(
            new SimpleGrantedAuthority("ROLE_ADMIN")
          )
        )
      );

      sesiones.put(
        sessionId,
        new Sesion(id, token)
      );

      return message;
    }

    Sesion sesion = sesiones.get(sessionId);

    if (sesion == null) {
      throw new BadCredentialsException(
        "Conexión no autenticada"
      );
    }

    Long id = validarAdministrador(sesion.token());

    if (
      !id.equals(sesion.usuarioId()) ||
      accessor.getUser() == null ||
      !id.toString().equals(
        accessor.getUser().getName()
      )
    ) {
      throw new AccessDeniedException(
        "La identidad de la conexión no coincide"
      );
    }

    // Cada administrador solo puede escuchar su canal privado.
    if (
      comando == StompCommand.SUBSCRIBE &&
      "/user/queue/notificaciones".equals(
        accessor.getDestination()
      )
    ) {
      return message;
    }

    // El navegador no puede publicar notificaciones
    // ni suscribirse a otros canales.
    throw new AccessDeniedException(
      "Operación WebSocket no permitida"
    );
  }

  public Message<?> filtrarSalida(Message<?> message) {
    if (
      SimpMessageHeaderAccessor.getMessageType(
        message.getHeaders()
      ) != SimpMessageType.MESSAGE
    ) {
      return message;
    }

    String sessionId =
      SimpMessageHeaderAccessor.getSessionId(
        message.getHeaders()
      );

    Sesion sesion = sessionId == null
      ? null
      : sesiones.get(sessionId);

    if (sesion == null) {
      return null;
    }

    // Comprobar también antes de entregar una notificación:
    // el JWT puede haber vencido o el rol puede haber cambiado.
    try {
      Long id = validarAdministrador(sesion.token());

      return id.equals(sesion.usuarioId())
        ? message
        : null;
    } catch (
      AuthenticationException | AccessDeniedException e
    ) {
      sesiones.remove(sessionId);
      return null;
    }
  }

  @EventListener
  public void desconectado(SessionDisconnectEvent event) {
    sesiones.remove(event.getSessionId());
  }
}