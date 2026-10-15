package com.techzone.techzone.controller;

import com.techzone.techzone.dto.Datos.*;
import com.techzone.techzone.dto.Mapeador;
import com.techzone.techzone.repository.ClienteRepository;
import com.techzone.techzone.service.*;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

  private final CatalogoService catalogo;
  private final VentasService ventas;
  private final CuentasService cuentas;
  private final ClienteRepository clientes;

  public AdminController(
    CatalogoService c,
    VentasService v,
    CuentasService cs,
    ClienteRepository cl
  ) {
    catalogo = c;
    ventas = v;
    cuentas = cs;
    clientes = cl;
  }

  @GetMapping("/usuarios")
  public List<UsuarioDTO> usuarios() {
    return cuentas.listar();
  }

  @PutMapping("/usuarios/{id}/rol")
  public UsuarioDTO rol(
    @PathVariable Long id,
    @Valid @RequestBody CambiarRol r
  ) {
    return cuentas.cambiarRol(id, r.rol());
  }

  @GetMapping("/productos")
  public List<ProductoDTO> productos(
    @RequestParam(required = false) String search
  ) {
    return catalogo.productos(null, search, true);
  }

  @PostMapping("/productos")
  public ProductoDTO crear(@Valid @RequestBody ProductoInput r) {
    return catalogo.guardarProducto(null, r);
  }

  @PutMapping("/productos/{id}")
  public ProductoDTO editar(
    @PathVariable Long id,
    @Valid @RequestBody ProductoInput r
  ) {
    return catalogo.guardarProducto(id, r);
  }

  @DeleteMapping("/productos/{id}")
  public void eliminar(@PathVariable Long id) {
    catalogo.eliminarProducto(id);
  }

  @GetMapping("/categorias")
  public List<CategoriaDTO> categorias() {
    return catalogo.categorias(true);
  }

  @PostMapping("/categorias")
  public CategoriaDTO crearCategoria(@Valid @RequestBody CategoriaInput r) {
    return catalogo.guardarCategoria(null, r);
  }

  @PutMapping("/categorias/{id}")
  public CategoriaDTO editarCategoria(
    @PathVariable Long id,
    @Valid @RequestBody CategoriaInput r
  ) {
    return catalogo.guardarCategoria(id, r);
  }

  @DeleteMapping("/categorias/{id}")
  public void borrarCategoria(@PathVariable Long id) {
    catalogo.eliminarCategoria(id);
  }

  @GetMapping("/marcas")
  public List<MarcaDTO> marcas() {
    return catalogo.marcas(true);
  }

  @PostMapping("/marcas")
  public MarcaDTO crearMarca(@Valid @RequestBody MarcaInput r) {
    return catalogo.guardarMarca(null, r);
  }

  @PutMapping("/marcas/{id}")
  public MarcaDTO editarMarca(
    @PathVariable Long id,
    @Valid @RequestBody MarcaInput r
  ) {
    return catalogo.guardarMarca(id, r);
  }

  @DeleteMapping("/marcas/{id}")
  public void borrarMarca(@PathVariable Long id) {
    catalogo.eliminarMarca(id);
  }

  @GetMapping("/ventas")
  public List<VentaDTO> ventas() {
    return ventas.listar();
  }

  @GetMapping("/ventas/{id}")
  public VentaDTO venta(@PathVariable Long id) {
    return ventas.ver(id);
  }

  @GetMapping("/ventas/{id}/detalles")
  public List<LineaDTO> lineas(@PathVariable Long id) {
    return ventas.ver(id).detalles();
  }

  @PostMapping("/ventas/{id}/detalles")
  public LineaDTO agregar(
    @PathVariable Long id,
    @Valid @RequestBody LineaInput r
  ) {
    return ventas.agregar(id, r);
  }

  @PutMapping("/ventas/{id}/detalles/{detalle}")
  public LineaDTO modificar(
    @PathVariable Long id,
    @PathVariable Long detalle,
    @Valid @RequestBody Cantidad r
  ) {
    return ventas.editar(id, detalle, r.cantidad());
  }

  @DeleteMapping("/ventas/{id}/detalles/{detalle}")
  public void quitar(@PathVariable Long id, @PathVariable Long detalle) {
    ventas.quitar(id, detalle);
  }

  @GetMapping("/clientes")
  @Transactional(readOnly = true)
  public List<ClienteDTO> clientes() {
    return clientes.findAll().stream().map(Mapeador::cliente).toList();
  }

  @GetMapping("/clientes/{dni}")
  @Transactional(readOnly = true)
  public Map<String, Object> cliente(@PathVariable String dni) {
    var c = clientes
      .findByDni(dni)
      .orElseThrow(() ->
        new ResponseStatusException(
          HttpStatus.NOT_FOUND,
          "Cliente no encontrado"
        )
      );
    var compras = ventas.comprasCliente(c.getIdCliente());
    return Map.of(
      "cliente",
      Mapeador.cliente(c),
      "compras",
      compras,
      "totalGastado",
      compras
        .stream()
        .map(VentaDTO::total)
        .reduce(BigDecimal.ZERO, BigDecimal::add)
    );
  }
}
