package com.techzone.techzone.service;

import com.techzone.techzone.dto.NotificacionDTO;
import com.techzone.techzone.dto.PaginaNotificacionesDTO;
import com.techzone.techzone.event.NotificacionCreadaEvent;
import com.techzone.techzone.model.Notificacion;
import com.techzone.techzone.model.UsuarioRol;
import com.techzone.techzone.model.Venta;
import com.techzone.techzone.repository.NotificacionRepository;
import com.techzone.techzone.repository.UsuarioRolRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class NotificacionesService {

  private final NotificacionRepository notificaciones;
  private final UsuarioRolRepository roles;
  private final ApplicationEventPublisher eventos;

  public NotificacionesService(
    NotificacionRepository notificaciones,
    UsuarioRolRepository roles,
    ApplicationEventPublisher eventos
  ) {
    this.notificaciones = notificaciones;
    this.roles = roles;
    this.eventos = eventos;
  }

  private NotificacionDTO dto(Notificacion n) {
    return new NotificacionDTO(
      n.getIdNotificacion(),
      n.getVenta().getIdVenta(),
      n.getVenta().getNumeroVenta(),
      n.getTipo(),
      n.getTitulo(),
      n.getMensaje(),
      n.getFechaCreacion(),
      n.isLeida()
    );
  }

  // Se ejecuta dentro de la misma transacción de la compra.
  @Transactional(
    propagation = Propagation.MANDATORY
  )
  public void registrarPedido(Venta venta) {
    var comprador = venta.getCliente().getUsuario();

    String nombre =
      comprador.getNombre() + " " +
      comprador.getApellido();

    var administradores =
      roles.findByRol_NombreAndUsuario_ActivoTrue(
        "ADMIN"
      );

    for (UsuarioRol asignacion : administradores) {
      var administrador = asignacion.getUsuario();

      Notificacion n = new Notificacion();

      n.setDestinatario(administrador);
      n.setVenta(venta);

      n.setTitulo(
        "Nuevo pedido " + venta.getNumeroVenta()
      );

      n.setMensaje(
        nombre +
        " realizó un pedido por S/ " +
        venta.getTotal().toPlainString() +
        ". Pago pendiente de verificación."
      );

      notificaciones.save(n);

      // El listener enviará el aviso después del commit.
      eventos.publishEvent(
        new NotificacionCreadaEvent(
          administrador.getIdUsuario(),
          dto(n)
        )
      );
    }
  }

  @Transactional(readOnly = true)
  public PaginaNotificacionesDTO listar(
    Long usuarioId,
    int pagina,
    int tamano
  ) {
    if (
      pagina < 0 ||
      tamano < 1 ||
      tamano > 50
    ) {
      throw new ResponseStatusException(
        HttpStatus.BAD_REQUEST,
        "La página debe ser mayor o igual a 0 " +
        "y el tamaño debe estar entre 1 y 50"
      );
    }

    var resultado = notificaciones
      .findByDestinatario_IdUsuarioOrderByIdNotificacionDesc(
        usuarioId,
        PageRequest.of(pagina, tamano)
      );

    var avisos = resultado
      .getContent()
      .stream()
      .map(this::dto)
      .toList();

    long noLeidas = notificaciones
      .countByDestinatario_IdUsuarioAndLeidaFalse(
        usuarioId
      );

    return new PaginaNotificacionesDTO(
      avisos,
      noLeidas,
      resultado.getNumber(),
      resultado.getTotalPages(),
      resultado.getTotalElements()
    );
  }

  public NotificacionDTO marcarLeida(
    Long usuarioId,
    Long idNotificacion
  ) {
    Notificacion n = notificaciones
      .findByIdNotificacionAndDestinatario_IdUsuario(
        idNotificacion,
        usuarioId
      )
      .orElseThrow(() ->
        new ResponseStatusException(
          HttpStatus.NOT_FOUND,
          "Notificación no encontrada"
        )
      );

    n.setLeida(true);

    return dto(n);
  }
}