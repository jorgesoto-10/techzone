package com.techzone.techzone.dto;

import java.time.Instant;

public record NotificacionDTO(
  Long idNotificacion,
  Long idVenta,
  String numeroVenta,
  String tipo,
  String titulo,
  String mensaje,
  Instant fechaCreacion,
  boolean leida
) {}