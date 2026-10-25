package com.techzone.techzone.model;

import jakarta.persistence.*;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(
  name = "notificacion",
  indexes = {
    @Index(
      name = "idx_notificacion_usuario_leida",
      columnList = "id_usuario,leida"
    )
  },
  uniqueConstraints = {
    @UniqueConstraint(
      name = "uk_notificacion_usuario_venta_tipo",
      columnNames = {
        "id_usuario",
        "id_venta",
        "tipo"
      }
    )
  }
)
public class Notificacion {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_notificacion")
  private Long idNotificacion;

  @ManyToOne(
    fetch = FetchType.LAZY,
    optional = false
  )
  @JoinColumn(
    name = "id_usuario",
    nullable = false
  )
  private Usuario destinatario;

  @ManyToOne(
    fetch = FetchType.LAZY,
    optional = false
  )
  @JoinColumn(
    name = "id_venta",
    nullable = false
  )
  private Venta venta;

  @Column(nullable = false, length = 30)
  private String tipo = "PEDIDO_NUEVO";

  @Column(nullable = false, length = 120)
  private String titulo;

  @Column(nullable = false, length = 500)
  private String mensaje;

  @Column(nullable = false)
  private boolean leida = false;

  @Column(
    name = "fecha_creacion",
    nullable = false
  )
  private Instant fechaCreacion = Instant.now();
}