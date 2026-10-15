package com.techzone.techzone.service;

import com.techzone.techzone.dto.Datos.*;
import com.techzone.techzone.dto.Mapeador;
import com.techzone.techzone.model.*;
import com.techzone.techzone.repository.*;
import java.math.BigDecimal;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class VentasService {

  private final VentaRepository ventas;
  private final DetalleVentaRepository detalles;
  private final ProductoRepository productos;
  private final ClienteRepository clientes;
  private final CuentasService cuentas;

  public VentasService(
    VentaRepository v,
    DetalleVentaRepository d,
    ProductoRepository p,
    ClienteRepository c,
    CuentasService cs
  ) {
    ventas = v;
    detalles = d;
    productos = p;
    clientes = c;
    cuentas = cs;
  }

  private Venta venta(Long id) {
    return ventas
      .bloquear(id)
      .orElseThrow(() -> error(HttpStatus.NOT_FOUND, "Venta no encontrada"));
  }

  private Producto producto(Long id) {
    return productos
      .bloquear(id)
      .orElseThrow(() -> error(HttpStatus.NOT_FOUND, "Producto no encontrado"));
  }

  private VentaDTO dto(Venta v) {
    return Mapeador.venta(
      v,
      detalles.findByVenta_IdVentaOrderByIdDetalle(v.getIdVenta())
    );
  }

  public List<VentaDTO> listar() {
    return ventas
      .findAllByOrderByFechaVentaDesc()
      .stream()
      .map(this::dto)
      .toList();
  }

  public VentaDTO ver(Long id) {
    return dto(
      ventas
        .findById(id)
        .orElseThrow(() -> error(HttpStatus.NOT_FOUND, "Venta no encontrada"))
    );
  }

  public List<VentaDTO> comprasUsuario(Long id) {
    return clientes
      .findByUsuario_IdUsuario(id)
      .map(c -> comprasCliente(c.getIdCliente()))
      .orElse(List.of());
  }

  public List<VentaDTO> comprasCliente(Long id) {
    return ventas
      .findByCliente_IdClienteOrderByFechaVentaDesc(id)
      .stream()
      .map(this::dto)
      .toList();
  }

  public VentaDTO comprar(Long usuario, Compra req) {
    if (
      !req.envio().equals("recojo") &&
      (req.direccion() == null || req.direccion().isBlank())
    ) throw error(
      HttpStatus.BAD_REQUEST,
      "Ingresa una dirección para la entrega"
    );
    if (
      req.items().stream().map(Item::idProducto).distinct().count() !=
      req.items().size()
    ) throw error(
      HttpStatus.BAD_REQUEST,
      "Agrupa los productos repetidos en una sola línea"
    );
    Venta v = new Venta();
    v.setCliente(cuentas.cliente(usuario));
    v.setNumeroVenta(
      "TZ-" + UUID.randomUUID().toString().substring(0, 18).toUpperCase()
    );
    v.setEnvio(req.envio());
    v.setDireccion(req.envio().equals("recojo") ? null : req.direccion());
    ventas.save(v);
    for (Item i : req
      .items()
      .stream()
      .sorted(Comparator.comparing(Item::idProducto))
      .toList()) {
      if (i.cantidad() < 1) throw error(
        HttpStatus.BAD_REQUEST,
        "Cantidad inválida"
      );
      agregar(v, i.idProducto(), i.cantidad());
    }
    return dto(v);
  }

  private void editable(Venta v) {
    if (!"REGISTRADA".equals(v.getEstado())) throw error(
      HttpStatus.CONFLICT,
      "Solo se pueden editar ventas registradas"
    );
  }

  private DetalleVenta agregar(Venta v, Long productoId, int cantidad) {
    if (cantidad < 1) throw error(
      HttpStatus.BAD_REQUEST,
      "Cantidad debe ser mayor que cero"
    );
    if (
      detalles.existsByVenta_IdVentaAndProducto_IdProducto(
        v.getIdVenta(),
        productoId
      )
    ) throw error(
      HttpStatus.CONFLICT,
      "El producto ya está en la venta; modifica su cantidad"
    );
    Producto p = producto(productoId);
    if (
      !p.isActivo() ||
      !p.getCategoria().isActivo() ||
      !p.getMarca().isActivo() ||
      p.getStock() < cantidad
    ) throw error(
      HttpStatus.CONFLICT,
      "Producto no disponible o stock insuficiente: " + p.getNombreProducto()
    );
    DetalleVenta d = new DetalleVenta();
    d.setVenta(v);
    d.setProducto(p);
    d.setCantidad(cantidad);
    d.setPrecioUnitario(p.getPrecio());
    d.setSubtotal(p.getPrecio().multiply(BigDecimal.valueOf(cantidad)));
    p.setStock(p.getStock() - cantidad);
    v.setTotal(v.getTotal().add(d.getSubtotal()));
    return detalles.save(d);
  }

  public LineaDTO agregar(Long id, LineaInput req) {
    Venta v = venta(id);
    editable(v);
    return Mapeador.linea(agregar(v, req.idProducto(), req.cantidad()));
  }

  public LineaDTO editar(Long id, Long detalleId, int cantidad) {
    Venta v = venta(id);
    editable(v);
    DetalleVenta d = linea(id, detalleId);
    Producto p = producto(d.getProducto().getIdProducto());
    int diferencia = cantidad - d.getCantidad();
    if (cantidad < 1 || diferencia > p.getStock()) throw error(
      HttpStatus.CONFLICT,
      "Cantidad inválida o stock insuficiente"
    );
    p.setStock(p.getStock() - diferencia);
    v.setTotal(v.getTotal().subtract(d.getSubtotal()));
    d.setCantidad(cantidad);
    d.setSubtotal(d.getPrecioUnitario().multiply(BigDecimal.valueOf(cantidad)));
    v.setTotal(v.getTotal().add(d.getSubtotal()));
    return Mapeador.linea(d);
  }

  public void quitar(Long id, Long detalleId) {
    Venta v = venta(id);
    editable(v);
    DetalleVenta d = linea(id, detalleId);
    Producto p = producto(d.getProducto().getIdProducto());
    p.setStock(p.getStock() + d.getCantidad());
    v.setTotal(v.getTotal().subtract(d.getSubtotal()));
    detalles.delete(d);
  }

  private DetalleVenta linea(Long venta, Long id) {
    DetalleVenta d = detalles
      .findById(id)
      .orElseThrow(() -> error(HttpStatus.NOT_FOUND, "Detalle no encontrado"));
    if (!d.getVenta().getIdVenta().equals(venta)) throw error(
      HttpStatus.NOT_FOUND,
      "Detalle no pertenece a esta venta"
    );
    return d;
  }

  private ResponseStatusException error(HttpStatus s, String msg) {
    return new ResponseStatusException(s, msg);
  }
}
