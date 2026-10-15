package com.techzone.techzone.controller;

import com.techzone.techzone.config.jwt.JwtUtil;
import com.techzone.techzone.dto.Datos.*;
import com.techzone.techzone.model.*;
import com.techzone.techzone.service.CuentasService;
import jakarta.validation.Valid;
import java.security.Principal;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  private final CuentasService cuentas;
  private final JwtUtil jwt;

  public AuthController(CuentasService c, JwtUtil j) {
    cuentas = c;
    jwt = j;
  }

  private Sesion sesion(Usuario u) {
    var dto = cuentas.dto(u);
    return new Sesion(
      jwt.generar(u.getIdUsuario()),
      cuentas.rolActual(u.getIdUsuario()),
      u.getIdUsuario().toString(),
      u.getNombre(),
      u.getApellido(),
      u.getCorreo(),
      dto.dniCliente()
    );
  }

  @PostMapping({ "/login", "/cliente/login", "/admin/login" })
  public Sesion login(@Valid @RequestBody Login data) {
    return sesion(cuentas.autenticar(data));
  }

  @PostMapping("/registro")
  @ResponseStatus(HttpStatus.CREATED)
  public Sesion registro(@Valid @RequestBody Registro data) {
    return sesion(cuentas.registrar(data));
  }

  @GetMapping("/me")
  public UsuarioDTO me(Principal principal) {
    return cuentas.dto(cuentas.buscar(Long.valueOf(principal.getName())));
  }
}
