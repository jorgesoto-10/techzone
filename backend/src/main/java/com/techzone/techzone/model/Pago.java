package com.techzone.techzone.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "pago")
public class Pago {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long idPago;

  @OneToOne(optional = false)
  @JoinColumn(name = "id_venta", nullable = false, unique = true)
  private Venta venta;

  @Column(nullable = false, length = 20)
  private String metodo;

  @Column(nullable = false, length = 20)
  private String estado = "PENDIENTE";

  @Column(nullable = false, precision = 12, scale = 2)
  private BigDecimal monto;

  @Lob
  @Column(nullable = false, columnDefinition = "LONGBLOB")
  private byte[] comprobante;

  @Column(nullable = false)
  private LocalDateTime fechaEnvio = LocalDateTime.now();

  private LocalDateTime fechaRevision;

  @ManyToOne
  @JoinColumn(name = "revisado_por")
  private Usuario revisadoPor;

  @Column(length = 500)
  private String observacion;
}