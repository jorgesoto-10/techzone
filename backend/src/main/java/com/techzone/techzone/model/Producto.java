package com.techzone.techzone.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "producto")
@org.hibernate.annotations.Check(constraints = "precio >= 0 AND stock >= 0")
public class Producto {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_producto")
  private Long idProducto;

  @ManyToOne(optional = false)
  @JoinColumn(name = "id_categoria", nullable = false)
  private Categoria categoria;

  @ManyToOne(optional = false)
  @JoinColumn(name = "id_marca", nullable = false)
  private Marca marca;

  @Column(nullable = false, unique = true, length = 50)
  private String sku;

  @Column(name = "nombre_producto", nullable = false, length = 150)
  private String nombreProducto;

  @Column(columnDefinition = "TEXT")
  private String descripcion;

  @Column(nullable = false, precision = 12, scale = 2)
  private java.math.BigDecimal precio;

  @Column(nullable = false)
  private int stock;

  @Column(length = 50)
  private String tipo;

  @Column(name = "imagen_url", length = 500)
  private String imagen;

  @Column(nullable = false)
  private boolean activo = true;

  @Column(name = "fecha_registro", nullable = false)
  private java.time.LocalDateTime fechaRegistro = java.time.LocalDateTime.now();
}
