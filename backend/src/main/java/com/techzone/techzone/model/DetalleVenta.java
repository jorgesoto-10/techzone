package com.techzone.techzone.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(
  name = "detalle_venta",
  uniqueConstraints = @UniqueConstraint(
    columnNames = { "id_venta", "id_producto" }
  )
)
@org.hibernate.annotations.Check(
  constraints = "cantidad > 0 AND precio_unitario >= 0 AND subtotal >= 0"
)
public class DetalleVenta {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_detalle_venta")
  private Long idDetalle;

  @ManyToOne(optional = false)
  @JoinColumn(name = "id_venta", nullable = false)
  private Venta venta;

  @ManyToOne(optional = false)
  @JoinColumn(name = "id_producto", nullable = false)
  private Producto producto;

  @Column(nullable = false)
  private int cantidad;

  @Column(name = "precio_unitario", nullable = false, precision = 12, scale = 2)
  private java.math.BigDecimal precioUnitario;

  @Column(nullable = false, precision = 12, scale = 2)
  private java.math.BigDecimal subtotal;
}
