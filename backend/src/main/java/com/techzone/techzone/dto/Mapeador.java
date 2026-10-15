package com.techzone.techzone.dto;

import com.techzone.techzone.dto.Datos.*;
import com.techzone.techzone.model.*;
import java.util.List;

public final class Mapeador {

  private Mapeador() {}

  public static ProductoDTO producto(Producto p) {
    return new ProductoDTO(
      p.getIdProducto(),
      p.getNombreProducto(),
      p.getPrecio(),
      p.getStock(),
      p.isActivo()
        ? (p.getStock() > 0 ? "disponible" : "agotado")
        : "descontinuado",
      p.getImagen(),
      p.getTipo(),
      p.getCategoria().getIdCategoria(),
      p.getCategoria().getNombreCategoria(),
      p.getMarca().getIdMarca(),
      p.getMarca().getNombre(),
      p.getSku(),
      p.getDescripcion(),
      p.isActivo()
    );
  }

  public static ClienteDTO cliente(Cliente c) {
    Usuario u = c.getUsuario();
    return new ClienteDTO(
      c.getIdCliente(),
      c.getDni(),
      u.getNombre(),
      u.getApellido(),
      u.getCorreo(),
      c.getTelefono()
    );
  }

  public static LineaDTO linea(DetalleVenta d) {
    return new LineaDTO(
      d.getIdDetalle(),
      d.getProducto().getIdProducto(),
      d.getProducto().getNombreProducto(),
      d.getCantidad(),
      d.getPrecioUnitario(),
      d.getSubtotal()
    );
  }

  public static VentaDTO venta(Venta v, List<DetalleVenta> detalles) {
    Usuario u = v.getCliente().getUsuario();
    return new VentaDTO(
      v.getIdVenta(),
      v.getNumeroVenta(),
      v.getFechaVenta(),
      v.getTotal(),
      v.getEstado(),
      v.getEstadoPago(),
      v.getEnvio(),
      v.getDireccion(),
      v.getCliente().getDni(),
      u.getNombre() + " " + u.getApellido(),
      detalles.stream().map(Mapeador::linea).toList()
    );
  }
}
