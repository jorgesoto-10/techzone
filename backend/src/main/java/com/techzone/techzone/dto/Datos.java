package com.techzone.techzone.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class Datos {

  public record Login(
    @NotBlank @Email String correo,
    @NotBlank String password
  ) {}

  public record Registro(
    @NotBlank @Pattern(regexp = "[0-9]{8}") String dniCliente,
    @NotBlank @Size(max = 100) String nombre,
    @NotBlank @Size(max = 100) String apellido,
    @NotBlank @Email @Size(max = 150) String correo,
    @Size(max = 20) String telefono,
    @NotBlank @Size(min = 8, max = 72) String password
  ) {}

  public record Sesion(
    String token,
    String rol,
    String id,
    String nombre,
    String apellido,
    String correo,
    String dniCliente
  ) {}

  public record UsuarioDTO(
    Long idUsuario,
    String nombre,
    String apellido,
    String correo,
    boolean activo,
    List<String> roles,
    String dniCliente
  ) {}

  public record CambiarRol(
    @NotBlank @Pattern(regexp = "ADMIN|CLIENTE") String rol
  ) {}

  public record CategoriaInput(
    @NotBlank @Size(max = 100) String nombreCategoria,
    @Size(max = 255) String descripcion,
    Boolean activo
  ) {}

  public record CategoriaDTO(
    Long idCategoria,
    String nombreCategoria,
    String descripcion,
    long totalProductos,
    boolean activo
  ) {}

  public record MarcaInput(
    @NotBlank @Size(max = 100) String nombre,
    Boolean activo
  ) {}

  public record MarcaDTO(Long idMarca, String nombre, boolean activo) {}

  public record ProductoInput(
    @NotBlank @Size(max = 150) String nombreProducto,
    @NotNull @DecimalMin("0.00") @Digits(
      integer = 10,
      fraction = 2
    ) BigDecimal precio,
    @Min(0) int stock,
    String estado,
    @Size(max = 500) String imagen,
    @Size(max = 50) String tipo,
    @NotNull Long idCategoria,
    @NotNull Long idMarca,
    @NotBlank @Size(max = 50) String sku,
    String descripcion,
    Boolean activo
  ) {}

  public record ProductoDTO(
    Long idProducto,
    String nombreProducto,
    BigDecimal precio,
    int stock,
    String estado,
    String imagen,
    String tipo,
    Long idCategoria,
    String nombreCategoria,
    Long idMarca,
    String nombreMarca,
    String sku,
    String descripcion,
    boolean activo
  ) {}

  public record ClienteDTO(
    Long idCliente,
    String dniCliente,
    String nombre,
    String apellido,
    String correo,
    String telefono
  ) {}

  public record Item(@NotNull Long idProducto, @Min(1) int cantidad) {}

  public record Compra(
    @NotBlank @Pattern(regexp = "recojo|delivery|shalom") String envio,
    @Size(max = 255) String direccion,
    @NotEmpty @Size(max = 100) List<@Valid Item> items
  ) {}

  public record LineaInput(@NotNull Long idProducto, @Min(1) int cantidad) {}

  public record Cantidad(@Min(1) int cantidad) {}

  public record LineaDTO(
    Long idDetalle,
    Long idProducto,
    String nombreProducto,
    int cantidad,
    BigDecimal precioUnitario,
    BigDecimal subtotal
  ) {}

  public record VentaDTO(
    Long idVenta,
    String numeroVenta,
    LocalDateTime fechaVenta,
    BigDecimal total,
    String estado,
    String estadoPago,
    String envio,
    String direccion,
    String dniCliente,
    String nombreCliente,
    List<LineaDTO> detalles
  ) {}
}
