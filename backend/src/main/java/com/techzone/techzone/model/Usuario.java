package com.techzone.techzone.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "usuario")
public class Usuario {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_usuario")
  private Long idUsuario;

  @Column(nullable = false, length = 100)
  private String nombre;

  @Column(nullable = false, length = 100)
  private String apellido;

  @Column(nullable = false, unique = true, length = 150)
  private String correo;

  @com.fasterxml.jackson.annotation.JsonIgnore
  @Column(name = "password_hash", nullable = false)
  private String passwordHash;

  @Column(nullable = false)
  private boolean activo = true;

  @Column(name = "fecha_registro", nullable = false)
  private java.time.LocalDateTime fechaRegistro = java.time.LocalDateTime.now();
}
