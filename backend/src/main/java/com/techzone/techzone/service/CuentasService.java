package com.techzone.techzone.service;

import com.techzone.techzone.dto.Datos.*;
import com.techzone.techzone.model.*;
import com.techzone.techzone.repository.*;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class CuentasService {

  private final UsuarioRepository usuarios;
  private final RolRepository roles;
  private final UsuarioRolRepository asignaciones;
  private final ClienteRepository clientes;
  private final PasswordEncoder encoder;

  public CuentasService(
    UsuarioRepository u,
    RolRepository r,
    UsuarioRolRepository a,
    ClienteRepository c,
    PasswordEncoder e
  ) {
    usuarios = u;
    roles = r;
    asignaciones = a;
    clientes = c;
    encoder = e;
  }

  public Usuario buscar(Long id) {
    return usuarios
      .findById(id)
      .orElseThrow(() ->
        new ResponseStatusException(
          HttpStatus.UNAUTHORIZED,
          "Cuenta no disponible"
        )
      );
  }

  public List<String> roles(Long id) {
    return asignaciones
      .findByUsuario_IdUsuario(id)
      .stream()
      .map(x -> x.getRol().getNombre())
      .toList();
  }

  public String rolActual(Long id) {
    return roles(id).contains("ADMIN") ? "ADMIN" : "CLIENTE";
  }

  public Usuario autenticar(Login req) {
    Usuario u = usuarios
      .findByCorreoIgnoreCase(req.correo().trim())
      .orElseThrow(() ->
        new ResponseStatusException(
          HttpStatus.UNAUTHORIZED,
          "Correo o contraseña incorrectos"
        )
      );
    if (
      !u.isActivo() || !encoder.matches(req.password(), u.getPasswordHash())
    ) throw new ResponseStatusException(
      HttpStatus.UNAUTHORIZED,
      "Correo o contraseña incorrectos"
    );
    return u;
  }

  public Usuario registrar(Registro r) {
    String correo = r.correo().trim().toLowerCase(Locale.ROOT);
    if (
      usuarios.findByCorreoIgnoreCase(correo).isPresent() ||
      clientes.findByDni(r.dniCliente()).isPresent()
    ) throw new ResponseStatusException(
      HttpStatus.CONFLICT,
      "Correo o DNI ya registrado"
    );
    Usuario u = new Usuario();
    u.setNombre(r.nombre().trim());
    u.setApellido(r.apellido().trim());
    u.setCorreo(correo);
    u.setPasswordHash(encoder.encode(r.password()));
    usuarios.save(u);
    asignar(u, "CLIENTE");
    Cliente c = new Cliente();
    c.setUsuario(u);
    c.setDni(r.dniCliente());
    c.setTelefono(r.telefono());
    clientes.save(c);
    return u;
  }

  public void asignar(Usuario u, String nombre) {
    UsuarioRol ur = new UsuarioRol();
    ur.setUsuario(u);
    ur.setRol(roles.findByNombre(nombre).orElseThrow());
    asignaciones.save(ur);
  }

  public List<UsuarioDTO> listar() {
    return usuarios.findAll().stream().map(this::dto).toList();
  }

  public UsuarioDTO dto(Usuario u) {
    return new UsuarioDTO(
      u.getIdUsuario(),
      u.getNombre(),
      u.getApellido(),
      u.getCorreo(),
      u.isActivo(),
      roles(u.getIdUsuario()),
      clientes
        .findByUsuario_IdUsuario(u.getIdUsuario())
        .map(Cliente::getDni)
        .orElse(null)
    );
  }

  public UsuarioDTO cambiarRol(Long id, String nuevo) {
    roles.bloquearAdmin();
    Usuario u = usuarios
      .findById(id)
      .orElseThrow(() ->
        new ResponseStatusException(
          HttpStatus.NOT_FOUND,
          "Usuario no encontrado"
        )
      );
    boolean eraAdmin = asignaciones.existsByUsuario_IdUsuarioAndRol_Nombre(
      id,
      "ADMIN"
    );
    if (
      eraAdmin &&
      nuevo.equals("CLIENTE") &&
      u.isActivo() &&
      asignaciones.countByRol_NombreAndUsuario_ActivoTrue("ADMIN") <= 1
    ) throw new ResponseStatusException(
      HttpStatus.CONFLICT,
      "No puedes quitar el rol al último administrador activo"
    );
    asignaciones.deleteByUsuario_IdUsuario(id);
    asignaciones.flush();
    asignar(u, nuevo);
    return dto(u);
  }

  public Cliente cliente(Long usuarioId) {
    return clientes
      .findByUsuario_IdUsuario(usuarioId)
      .orElseThrow(() ->
        new ResponseStatusException(
          HttpStatus.CONFLICT,
          "Completa tu DNI y teléfono en Mi perfil antes de comprar"
        )
      );
  }

  public Cliente completar(Long id, String dni, String telefono) {
    var existente = clientes.findByDni(dni);
    if (
      existente.isPresent() &&
      !existente.get().getUsuario().getIdUsuario().equals(id)
    ) throw new ResponseStatusException(
      HttpStatus.CONFLICT,
      "DNI ya registrado"
    );
    Cliente c = clientes.findByUsuario_IdUsuario(id).orElseGet(Cliente::new);
    c.setUsuario(buscar(id));
    c.setDni(dni);
    c.setTelefono(telefono);
    return clientes.save(c);
  }
}
