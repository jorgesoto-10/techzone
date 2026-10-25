package com.techzone.techzone.repository;

import com.techzone.techzone.model.Notificacion;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificacionRepository
  extends JpaRepository<Notificacion, Long> {

  Page<Notificacion>
    findByDestinatario_IdUsuarioOrderByIdNotificacionDesc(
      Long usuarioId,
      Pageable pageable
    );

  long countByDestinatario_IdUsuarioAndLeidaFalse(
    Long usuarioId
  );

  Optional<Notificacion>
    findByIdNotificacionAndDestinatario_IdUsuario(
      Long idNotificacion,
      Long usuarioId
    );
}