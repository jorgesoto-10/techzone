package com.techzone.techzone.service;

import com.techzone.techzone.dto.Datos.Compra;
import com.techzone.techzone.dto.Mapeador;
import com.techzone.techzone.dto.PagoDatos.*;
import com.techzone.techzone.model.*;
import com.techzone.techzone.repository.*;
import java.awt.image.BufferedImage;
import java.io.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import javax.imageio.ImageIO;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class PagosService {

  private final VentaRepository ventas;
  private final PagoRepository pagos;
  private final DetalleVentaRepository detalles;
  private final ProductoRepository productos;
  private final VentasService compras;
  private final CuentasService cuentas;
  private final NotificacionesService notificaciones;


  public PagosService(
    VentaRepository v,
    PagoRepository p,
    DetalleVentaRepository d,
    ProductoRepository pr,
    VentasService c,
    CuentasService u,
    NotificacionesService notificaciones
  ) {
    ventas = v;
    pagos = p;
    detalles = d;
    productos = pr;
    compras = c;
    cuentas = u;
    this.notificaciones = notificaciones;
  }

  private ResponseStatusException error(
    HttpStatus status,
    String mensaje
  ) {
    return new ResponseStatusException(status, mensaje);
  }

  private Venta bloquear(Long id) {
    return ventas.bloquear(id).orElseThrow(() ->
      error(HttpStatus.NOT_FOUND, "Pedido no encontrado")
    );
  }

  private Pago pago(Venta v) {
    return pagos
      .findByVenta_IdVenta(v.getIdVenta())
      .orElseThrow(() ->
        error(
          HttpStatus.NOT_FOUND,
          "Este pedido no tiene un pago para revisar"
        )
      );
  }

  private void propietario(Venta v, Long usuario) {
    if (
      !v.getCliente().getUsuario().getIdUsuario().equals(usuario)
    ) {
      throw error(HttpStatus.NOT_FOUND, "Pedido no encontrado");
    }
  }

  private Resumen resumen(Venta v) {
    BigDecimal envio = v.getCostoEnvio() == null
      ? BigDecimal.ZERO
      : v.getCostoEnvio();

    PagoDTO p = pagos
      .findByVenta_IdVenta(v.getIdVenta())
      .map(x ->
        new PagoDTO(
          x.getIdPago(),
          x.getMetodo(),
          x.getEstado(),
          x.getMonto(),
          x.getFechaEnvio(),
          x.getFechaRevision(),
          x.getObservacion()
        )
      )
      .orElse(null);

    return new Resumen(
      Mapeador.venta(
        v,
        detalles.findByVenta_IdVentaOrderByIdDetalle(v.getIdVenta())
      ),
      v.getTotal().subtract(envio),
      envio,
      v.getDestinatario(),
      v.getTelefonoEntrega(),
      v.getAgencia(),
      p
    );
  }

  public Resumen ver(Long id, Long usuario, boolean admin) {
    Venta v = ventas.findById(id).orElseThrow(() ->
      error(HttpStatus.NOT_FOUND, "Pedido no encontrado")
    );

    if (!admin) {
      propietario(v, usuario);
    }

    return resumen(v);
  }

  public byte[] comprobante(
    Long id,
    Long usuario,
    boolean admin
  ) {
    Venta v = ventas.findById(id).orElseThrow(() ->
      error(HttpStatus.NOT_FOUND, "Pedido no encontrado")
    );

    if (!admin) {
      propietario(v, usuario);
    }

    return pago(v).getComprobante();
  }

  private byte[] imagen(MultipartFile archivo) {
    if (
      archivo == null ||
      archivo.isEmpty() ||
      archivo.getSize() > 5 * 1024 * 1024
    ) {
      throw error(
        HttpStatus.BAD_REQUEST,
        "Adjunta una imagen JPG o PNG de hasta 5 MB"
      );
    }

    try (
      var input = ImageIO.createImageInputStream(
        archivo.getInputStream()
      )
    ) {
      var readers = ImageIO.getImageReaders(input);

      if (!readers.hasNext()) {
        throw new IOException();
      }

      var reader = readers.next();

      try {
        String formato = reader
          .getFormatName()
          .toLowerCase(Locale.ROOT);

        if (!Set.of("png", "jpeg", "jpg").contains(formato)) {
          throw new IOException();
        }

        reader.setInput(input);

        if (
          (long) reader.getWidth(0) * reader.getHeight(0)
            > 16_000_000
        ) {
          throw new IOException();
        }

        BufferedImage img = reader.read(0);
        ByteArrayOutputStream salida = new ByteArrayOutputStream();

        if (
          img == null ||
          !ImageIO.write(img, "png", salida)
        ) {
          throw new IOException();
        }

        if (salida.size() > 8 * 1024 * 1024) {
          throw new IOException();
        }

        return salida.toByteArray();
      } finally {
        reader.dispose();
      }
    } catch (IOException | IllegalArgumentException e) {
      throw error(
        HttpStatus.BAD_REQUEST,
        "Imagen inválida o demasiado grande. " +
        "Usa JPG/PNG de hasta 16 megapíxeles"
      );
    }
  }

  public Map<String, BigDecimal> cotizar(Compra r) {
    BigDecimal subtotal = BigDecimal.ZERO;

    for (var item : r.items()) {
      Producto p = productos
        .findById(item.idProducto())
        .orElseThrow(() ->
          error(HttpStatus.NOT_FOUND, "Producto no encontrado")
        );

      if (
        !p.isActivo() ||
        !p.getCategoria().isActivo() ||
        !p.getMarca().isActivo() ||
        item.cantidad() > p.getStock()
      ) {
        throw error(
          HttpStatus.CONFLICT,
          "Producto no disponible o stock insuficiente"
        );
      }

      subtotal = subtotal.add(
        p.getPrecio().multiply(
          BigDecimal.valueOf(item.cantidad())
        )
      );
    }

    BigDecimal costo = new BigDecimal(
      r.envio().equals("delivery")
        ? "10.00"
        : r.envio().equals("shalom")
          ? "15.00"
          : "0.00"
    );

    return Map.of(
      "subtotal", subtotal,
      "costoEnvio", costo,
      "total", subtotal.add(costo)
    );
  }

  public Resumen checkout(
    Long usuario,
    Checkout r,
    MultipartFile archivo
  ) {
    byte[] bytes = imagen(archivo);

    if (
      r.envio().equals("delivery") &&
      (r.direccion() == null || r.direccion().isBlank())
    ) {
      throw error(
        HttpStatus.BAD_REQUEST,
        "Ingresa la dirección del delivery"
      );
    }

    if (
      r.envio().equals("shalom") &&
      (r.agencia() == null || r.agencia().isBlank())
    ) {
      throw error(
        HttpStatus.BAD_REQUEST,
        "Ingresa ciudad y agencia de Shalom"
      );
    }

    BigDecimal envio = switch (r.envio()) {
      case "recojo" -> new BigDecimal("0.00");
      case "delivery" -> new BigDecimal("10.00");
      case "shalom" -> new BigDecimal("15.00");
      default -> throw error(
        HttpStatus.BAD_REQUEST,
        "Entrega inválida"
      );
    };

    String destino = r.envio().equals("shalom")
      ? r.agencia()
      : r.direccion();

    var creada = compras.comprar(
      usuario,
      new Compra(r.envio(), destino, r.items())
    );

    Venta v = bloquear(creada.idVenta());

    v.setDireccion(
      r.envio().equals("delivery")
        ? r.direccion().trim()
        : null
    );

    v.setAgencia(
      r.envio().equals("shalom")
        ? r.agencia().trim()
        : null
    );

    v.setDestinatario(r.destinatario().trim());
    v.setTelefonoEntrega(r.telefono());
    v.setCostoEnvio(envio);
    v.setTotal(v.getTotal().add(envio));

    if (v.getTotal().compareTo(r.totalEsperado()) != 0) {
      throw error(
        HttpStatus.CONFLICT,
        "Los precios cambiaron. " +
        "Actualiza el resumen antes de continuar"
      );
    }

    v.setEstado("PENDIENTE_PAGO");
    v.setEstadoPago("PENDIENTE");

    Pago p = new Pago();
    p.setVenta(v);
    p.setMetodo(r.metodo());
    p.setMonto(v.getTotal());
    p.setComprobante(bytes);

    pagos.save(p);

    notificaciones.registrarPedido(v);

    return resumen(v);
  }

  public Resumen reenviar(
    Long id,
    Long usuario,
    MultipartFile archivo
  ) {
    Venta v = bloquear(id);
    propietario(v, usuario);

    Pago p = pago(v);

    if (
      !"RECHAZADO".equals(p.getEstado()) ||
      !"PENDIENTE_PAGO".equals(v.getEstado())
    ) {
      throw error(
        HttpStatus.CONFLICT,
        "Solo puedes corregir pagos rechazados de pedidos vigentes"
      );
    }

    p.setComprobante(imagen(archivo));
    p.setEstado("PENDIENTE");
    p.setFechaEnvio(LocalDateTime.now());
    p.setFechaRevision(null);
    p.setRevisadoPor(null);
    p.setObservacion(null);

    v.setEstadoPago("PENDIENTE");

    return resumen(v);
  }

  public Resumen revisar(
    Long id,
    Long admin,
    Revision r
  ) {
    Venta v = bloquear(id);
    Pago p = pago(v);

    if (
      !"PENDIENTE".equals(p.getEstado()) ||
      !"PENDIENTE_PAGO".equals(v.getEstado())
    ) {
      throw error(
        HttpStatus.CONFLICT,
        "El pago ya fue revisado o el pedido está cancelado"
      );
    }

    if (
      r.estado().equals("RECHAZADO") &&
      (
        r.observacion() == null ||
        r.observacion().isBlank()
      )
    ) {
      throw error(
        HttpStatus.BAD_REQUEST,
        "Indica el motivo del rechazo"
      );
    }

    if (p.getMonto().compareTo(v.getTotal()) != 0) {
      throw error(
        HttpStatus.CONFLICT,
        "El monto del pago no coincide con el pedido"
      );
    }

    p.setEstado(r.estado());
    p.setObservacion(r.observacion());
    p.setFechaRevision(LocalDateTime.now());
    p.setRevisadoPor(cuentas.buscar(admin));

    v.setEstadoPago(r.estado());

    if (r.estado().equals("APROBADO")) {
      v.setEstado("CONFIRMADA");
    }

    return resumen(v);
  }

  public Resumen cambiarEstado(Long id, String nuevo) {
    Venta v = bloquear(id);
    Pago p = pago(v);

    if (nuevo.equals("CANCELADA")) {
      if (
        !"PENDIENTE_PAGO".equals(v.getEstado()) ||
        "APROBADO".equals(p.getEstado())
      ) {
        throw error(
          HttpStatus.CONFLICT,
          "Solo se cancelan pedidos pendientes sin pago aprobado"
        );
      }

      var lineas = detalles
        .findByVenta_IdVentaOrderByIdDetalle(id)
        .stream()
        .sorted(
          Comparator.comparing(
            x -> x.getProducto().getIdProducto()
          )
        )
        .toList();

      for (DetalleVenta d : lineas) {
        Producto producto = productos
          .bloquear(d.getProducto().getIdProducto())
          .orElseThrow();

        producto.setStock(
          producto.getStock() + d.getCantidad()
        );
      }

      p.setEstado("CANCELADO");
      v.setEstadoPago("CANCELADO");
    } else {
      String siguiente = switch (v.getEstado()) {
        case "CONFIRMADA" -> "PREPARANDO";
        case "PREPARANDO" -> "LISTO_ENTREGA";
        case "LISTO_ENTREGA" -> "ENTREGADA";
        default -> "";
      };

      if (
        !"APROBADO".equals(p.getEstado()) ||
        !siguiente.equals(nuevo)
      ) {
        throw error(
          HttpStatus.CONFLICT,
          "Aprueba el pago y respeta el orden de preparación y entrega"
        );
      }
    }

    v.setEstado(nuevo);

    return resumen(v);
  }
}