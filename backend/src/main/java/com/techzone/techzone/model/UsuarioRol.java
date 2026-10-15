package com.techzone.techzone.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(
  name = "usuario_rol",
  uniqueConstraints = @UniqueConstraint(
    columnNames = { "id_usuario", "id_rol" }
  )
)
public class UsuarioRol {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_usuario_rol")
  private Long idUsuarioRol;

  @ManyToOne(optional = false)
  @JoinColumn(name = "id_usuario", nullable = false)
  private Usuario usuario;

  @ManyToOne(optional = false)
  @JoinColumn(name = "id_rol", nullable = false)
  private Rol rol;

  @Column(name = "fecha_asignacion", nullable = false)
  private java.time.LocalDateTime fechaAsignacion =
    java.time.LocalDateTime.now();
}
