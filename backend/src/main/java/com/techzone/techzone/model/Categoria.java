package com.techzone.techzone.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "categoria")
public class Categoria {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_categoria")
  private Long idCategoria;

  @Column(
    name = "nombre_categoria",
    nullable = false,
    unique = true,
    length = 100
  )
  private String nombreCategoria;

  @Column(length = 255)
  private String descripcion;

  @Column(nullable = false)
  private boolean activo = true;
}
