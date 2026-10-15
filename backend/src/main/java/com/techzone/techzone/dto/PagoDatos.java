package com.techzone.techzone.dto;

import com.techzone.techzone.dto.Datos.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public final class PagoDatos {

  private PagoDatos() {}

  public record Checkout(
    @NotBlank
    @Pattern(regexp = "recojo|delivery|shalom")
    String envio,

    @NotBlank
    @Size(max = 150)
    String destinatario,

    @NotBlank
    @Pattern(regexp = "[0-9]{9}")
    String telefono,

    @Size(max = 255)
    String direccion,

    @Size(max = 255)
    String agencia,

    @NotBlank
    @Pattern(regexp = "YAPE|PLIN|TRANSFERENCIA")
    String metodo,

    @NotNull
    @DecimalMin("0.00")
    @Digits(integer = 10, fraction = 2)
    BigDecimal totalEsperado,

    @NotEmpty
    @Size(max = 100)
    List<@Valid Item> items
  ) {}

  public record Revision(
    @NotBlank
    @Pattern(regexp = "APROBADO|RECHAZADO")
    String estado,

    @Size(max = 500)
    String observacion
  ) {}

  public record EstadoPedido(
    @NotBlank
    @Pattern(
      regexp = "PREPARANDO|LISTO_ENTREGA|ENTREGADA|CANCELADA"
    )
    String estado
  ) {}

  public record PagoDTO(
    Long idPago,
    String metodo,
    String estado,
    BigDecimal monto,
    LocalDateTime fechaEnvio,
    LocalDateTime fechaRevision,
    String observacion
  ) {}

  public record Resumen(
    VentaDTO venta,
    BigDecimal subtotal,
    BigDecimal costoEnvio,
    String destinatario,
    String telefono,
    String agencia,
    PagoDTO pago
  ) {}
}