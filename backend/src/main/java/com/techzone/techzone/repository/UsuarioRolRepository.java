package com.techzone.techzone.repository;

import com.techzone.techzone.model.UsuarioRol;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRolRepository
  extends JpaRepository<UsuarioRol, Long> {

  List<UsuarioRol> findByUsuario_IdUsuario(Long id);

  boolean existsByUsuario_IdUsuarioAndRol_Nombre(
    Long id,
    String nombre
  );

  long countByRol_NombreAndUsuario_ActivoTrue(
    String nombre
  );

  void deleteByUsuario_IdUsuario(Long id);

  List<UsuarioRol> findByRol_NombreAndUsuario_ActivoTrue(
    String nombre
  );
}