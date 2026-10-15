package com.techzone.techzone.controller;

import com.techzone.techzone.dto.Datos.*;
import com.techzone.techzone.dto.Mapeador;
import com.techzone.techzone.service.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.security.Principal;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class CompraController {

  private final VentasService ventas;
  private final CuentasService cuentas;

  public CompraController(
    VentasService v,
    CuentasService c
  ) {
    ventas = v;
    cuentas = c;
  }

  @GetMapping("/ventas/mis-compras")
  public List<VentaDTO> compras(Principal p) {
    return ventas.comprasUsuario(
      Long.valueOf(p.getName())
    );
  }

  public record Perfil(
    @Pattern(regexp = "[0-9]{8}")
    @NotBlank
    String dniCliente,

    @Size(max = 20)
    String telefono
  ) {}

  @PutMapping("/perfil")
  public ClienteDTO perfil(
    @Valid @RequestBody Perfil r,
    Principal p
  ) {
    return Mapeador.cliente(
      cuentas.completar(
        Long.valueOf(p.getName()),
        r.dniCliente(),
        r.telefono()
      )
    );
  }
}