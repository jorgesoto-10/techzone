package com.techzone.techzone.event;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class NotificacionWebSocketListener {

  private static final Logger log =
    LoggerFactory.getLogger(
      NotificacionWebSocketListener.class
    );

  private final SimpMessagingTemplate mensajeria;

  public NotificacionWebSocketListener(
    SimpMessagingTemplate mensajeria
  ) {
    this.mensajeria = mensajeria;
  }

  @TransactionalEventListener(
    phase = TransactionPhase.AFTER_COMMIT
  )
  public void enviar(NotificacionCreadaEvent evento) {
    try {
      mensajeria.convertAndSendToUser(
        evento.destinatarioId().toString(),
        "/queue/notificaciones",
        evento.notificacion()
      );
    } catch (RuntimeException e) {
      log.warn(
        "La notificación {} quedó guardada, " +
        "pero no pudo enviarse por WebSocket",
        evento.notificacion().idNotificacion(),
        e
      );
    }
  }
}