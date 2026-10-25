package com.techzone.techzone.event;

import com.techzone.techzone.dto.NotificacionDTO;

public record NotificacionCreadaEvent(
  Long destinatarioId,
  NotificacionDTO notificacion
) {}