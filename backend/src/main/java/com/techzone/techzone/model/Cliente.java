package com.techzone.techzone.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "cliente")
public class Cliente {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_cliente")
  private Long idCliente;

  @OneToOne(optional = false)
  @JoinColumn(name = "id_usuario", nullable = false, unique = true)
  private Usuario usuario;

  @Column(nullable = false, unique = true, length = 8)
  private String dni;

  @Column(length = 20)
  private String telefono;
}
