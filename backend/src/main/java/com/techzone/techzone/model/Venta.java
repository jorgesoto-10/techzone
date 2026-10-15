package com.techzone.techzone.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "venta")
public class Venta {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_venta")
  private Long idVenta;

  @Column(name = "numero_venta", nullable = false, unique = true, length = 40)
  private String numeroVenta;

  @ManyToOne(optional = false)
  @JoinColumn(name = "id_cliente", nullable = false)
  private Cliente cliente;

  @Column(name = "fecha_venta", nullable = false)
  private LocalDateTime fechaVenta = LocalDateTime.now();

  @Column(name = "estado_venta", nullable = false, length = 30)
  private String estado = "REGISTRADA";

  @Column(name = "estado_pago", nullable = false, length = 30)
  private String estadoPago = "SIMULADO";

  @Column(name = "tipo_entrega", nullable = false, length = 30)
  private String envio;

  @Column(name = "direccion_entrega", length = 255)
  private String direccion;

  @Column(nullable = false, precision = 12, scale = 2)
  private BigDecimal total = BigDecimal.ZERO;

  @Column(name = "costo_envio", precision = 12, scale = 2)
  private BigDecimal costoEnvio;

  @Column(length = 150)
  private String destinatario;

  @Column(name = "telefono_entrega", length = 20)
  private String telefonoEntrega;

  @Column(length = 255)
  private String agencia;
}