package com.techzone.techzone.dto;

import java.util.List;

public record PaginaNotificacionesDTO(
  List<NotificacionDTO> notificaciones,
  long noLeidas,
  int pagina,
  int totalPaginas,
  long total
) {}