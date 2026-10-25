package com.techzone.techzone.controller;

import com.techzone.techzone.dto.NotificacionDTO;
import com.techzone.techzone.dto.PaginaNotificacionesDTO;
import com.techzone.techzone.service.NotificacionesService;
import java.security.Principal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/notificaciones")
public class NotificacionesController {

  private final NotificacionesService notificaciones;

  public NotificacionesController(
    NotificacionesService notificaciones
  ) {
    this.notificaciones = notificaciones;
  }

  @GetMapping
  public PaginaNotificacionesDTO listar(
    Principal usuario,

    @RequestParam(
      name = "page",
      defaultValue = "0"
    )
    int pagina,

    @RequestParam(
      name = "size",
      defaultValue = "10"
    )
    int tamano
  ) {
    return notificaciones.listar(
      Long.valueOf(usuario.getName()),
      pagina,
      tamano
    );
  }

  @PutMapping("/{id}/leida")
  public NotificacionDTO marcarLeida(
    @PathVariable Long id,
    Principal usuario
  ) {
    return notificaciones.marcarLeida(
      Long.valueOf(usuario.getName()),
      id
    );
  }
}