package com.techzone.techzone.controller;

import com.techzone.techzone.dto.Datos.Compra;
import com.techzone.techzone.dto.PagoDatos.*;
import com.techzone.techzone.service.PagosService;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.Map;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
public class PagosController {

  private final PagosService pagos;

  public PagosController(PagosService p) {
    pagos = p;
  }

  private Long usuario(Authentication a) {
    return Long.valueOf(a.getName());
  }

  private boolean admin(Authentication a) {
    return a.getAuthorities().stream().anyMatch(
      x -> x.getAuthority().equals("ROLE_ADMIN")
    );
  }

  @PostMapping("/ventas/cotizar")
  public Map<String, BigDecimal> cotizar(
    @Valid @RequestBody Compra datos
  ) {
    return pagos.cotizar(datos);
  }

  @PostMapping(
    value = "/ventas/checkout",
    consumes = MediaType.MULTIPART_FORM_DATA_VALUE
  )
  public Resumen checkout(
    @Valid @RequestPart("datos") Checkout datos,
    @RequestPart("comprobante") MultipartFile archivo,
    Authentication a
  ) {
    return pagos.checkout(usuario(a), datos, archivo);
  }

  @GetMapping({
    "/ventas/{id}/pago",
    "/admin/ventas/{id}/pago"
  })
  public Resumen ver(
    @PathVariable Long id,
    Authentication a
  ) {
    return pagos.ver(id, usuario(a), admin(a));
  }

  @GetMapping(
    value = {
      "/ventas/{id}/comprobante",
      "/admin/ventas/{id}/comprobante"
    },
    produces = MediaType.IMAGE_PNG_VALUE
  )
  public ResponseEntity<byte[]> comprobante(
    @PathVariable Long id,
    Authentication a
  ) {
    return ResponseEntity
      .ok()
      .contentType(MediaType.IMAGE_PNG)
      .cacheControl(CacheControl.noStore())
      .header("X-Content-Type-Options", "nosniff")
      .header(
        HttpHeaders.CONTENT_DISPOSITION,
        "inline; filename=comprobante.png"
      )
      .body(
        pagos.comprobante(id, usuario(a), admin(a))
      );
  }

  @PutMapping(
    value = "/ventas/{id}/comprobante",
    consumes = MediaType.MULTIPART_FORM_DATA_VALUE
  )
  public Resumen reenviar(
    @PathVariable Long id,
    @RequestPart("comprobante") MultipartFile archivo,
    Authentication a
  ) {
    return pagos.reenviar(id, usuario(a), archivo);
  }

  @PutMapping("/admin/ventas/{id}/pago")
  public Resumen revisar(
    @PathVariable Long id,
    @Valid @RequestBody Revision datos,
    Authentication a
  ) {
    return pagos.revisar(id, usuario(a), datos);
  }

  @PutMapping("/admin/ventas/{id}/estado")
  public Resumen estado(
    @PathVariable Long id,
    @Valid @RequestBody EstadoPedido datos
  ) {
    return pagos.cambiarEstado(id, datos.estado());
  }
}