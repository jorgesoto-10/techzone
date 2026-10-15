package com.techzone.techzone.repository;

import com.techzone.techzone.model.Rol;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RolRepository extends JpaRepository<Rol, Long> {
  Optional<Rol> findByNombre(String nombre);

  @org.springframework.data.jpa.repository.Lock(
    jakarta.persistence.LockModeType.PESSIMISTIC_WRITE
  )
  @org.springframework.data.jpa.repository.Query(
    "select r from Rol r where r.nombre = 'ADMIN'"
  )
  Rol bloquearAdmin();
}
