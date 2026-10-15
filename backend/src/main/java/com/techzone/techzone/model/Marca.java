package com.techzone.techzone.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "marca")
public class Marca {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_marca")
  private Long idMarca;

  @Column(nullable = false, unique = true, length = 100)
  private String nombre;

  @Column(nullable = false)
  private boolean activo = true;
}
