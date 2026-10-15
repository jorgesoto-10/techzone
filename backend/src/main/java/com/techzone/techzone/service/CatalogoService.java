package com.techzone.techzone.service;

import com.techzone.techzone.dto.Datos.*;
import com.techzone.techzone.dto.Mapeador;
import com.techzone.techzone.model.*;
import com.techzone.techzone.repository.*;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class CatalogoService {

  private final ProductoRepository productos;
  private final CategoriaRepository categorias;
  private final MarcaRepository marcas;
  private final DetalleVentaRepository detalles;

  public CatalogoService(
    ProductoRepository p,
    CategoriaRepository c,
    MarcaRepository m,
    DetalleVentaRepository d
  ) {
    productos = p;
    categorias = c;
    marcas = m;
    detalles = d;
  }

  public List<ProductoDTO> productos(
    Long categoria,
    String search,
    boolean admin
  ) {
    return productos
      .findAll()
      .stream()
      .filter(
        p ->
          admin ||
          (p.isActivo() &&
            p.getCategoria().isActivo() &&
            p.getMarca().isActivo())
      )
      .filter(
        p ->
          categoria == null ||
          p.getCategoria().getIdCategoria().equals(categoria)
      )
      .filter(
        p ->
          search == null ||
          p
            .getNombreProducto()
            .toLowerCase(Locale.ROOT)
            .contains(search.toLowerCase(Locale.ROOT))
      )
      .map(Mapeador::producto)
      .toList();
  }

  public ProductoDTO producto(Long id) {
    return Mapeador.producto(
      productos
        .findById(id)
        .filter(Producto::isActivo)
        .orElseThrow(() -> no("Producto"))
    );
  }

  public CategoriaDTO categoria(Categoria c) {
    return new CategoriaDTO(
      c.getIdCategoria(),
      c.getNombreCategoria(),
      c.getDescripcion(),
      productos
        .findAll()
        .stream()
        .filter(p ->
          p.getCategoria().getIdCategoria().equals(c.getIdCategoria())
        )
        .count(),
      c.isActivo()
    );
  }

  public List<CategoriaDTO> categorias(boolean admin) {
    return categorias
      .findAll()
      .stream()
      .filter(c -> admin || c.isActivo())
      .map(this::categoria)
      .toList();
  }

  public List<MarcaDTO> marcas(boolean admin) {
    return marcas
      .findAll()
      .stream()
      .filter(m -> admin || m.isActivo())
      .map(m -> new MarcaDTO(m.getIdMarca(), m.getNombre(), m.isActivo()))
      .toList();
  }

  public ProductoDTO guardarProducto(Long id, ProductoInput r) {
    Producto p = id == null
      ? new Producto()
      : productos.bloquear(id).orElseThrow(() -> no("Producto"));
    if (
      productos
        .findAll()
        .stream()
        .anyMatch(
          x ->
            x.getSku().equalsIgnoreCase(r.sku().trim()) &&
            !Objects.equals(x.getIdProducto(), id)
        )
    ) throw conflicto("El SKU ya existe");
    p.setCategoria(
      categorias.findById(r.idCategoria()).orElseThrow(() -> no("Categoría"))
    );
    p.setMarca(marcas.findById(r.idMarca()).orElseThrow(() -> no("Marca")));
    p.setNombreProducto(r.nombreProducto().trim());
    p.setPrecio(r.precio());
    p.setStock(r.stock());
    p.setSku(r.sku().trim());
    p.setDescripcion(r.descripcion());
    p.setTipo(r.tipo());
    p.setImagen(r.imagen());
    p.setActivo(
      r.activo() != null ? r.activo() : !"descontinuado".equals(r.estado())
    );
    return Mapeador.producto(productos.save(p));
  }

  public void eliminarProducto(Long id) {
    Producto p = productos.findById(id).orElseThrow(() -> no("Producto"));
    if (detalles.existsByProducto_IdProducto(id)) throw conflicto(
      "El producto aparece en ventas; desactívalo para conservar el historial"
    );
    productos.delete(p);
  }

  public CategoriaDTO guardarCategoria(Long id, CategoriaInput r) {
    Categoria c = id == null
      ? new Categoria()
      : categorias.findById(id).orElseThrow(() -> no("Categoría"));
    c.setNombreCategoria(r.nombreCategoria().trim());
    c.setDescripcion(r.descripcion());
    if (r.activo() != null) c.setActivo(r.activo());
    return categoria(categorias.save(c));
  }

  public void eliminarCategoria(Long id) {
    if (productos.existsByCategoria_IdCategoria(id)) throw conflicto(
      "La categoría tiene productos; puedes desactivarla"
    );
    categorias.delete(
      categorias.findById(id).orElseThrow(() -> no("Categoría"))
    );
  }

  public MarcaDTO guardarMarca(Long id, MarcaInput r) {
    Marca m = id == null
      ? new Marca()
      : marcas.findById(id).orElseThrow(() -> no("Marca"));
    m.setNombre(r.nombre().trim());
    if (r.activo() != null) m.setActivo(r.activo());
    marcas.save(m);
    return new MarcaDTO(m.getIdMarca(), m.getNombre(), m.isActivo());
  }

  public void eliminarMarca(Long id) {
    if (productos.existsByMarca_IdMarca(id)) throw conflicto(
      "La marca tiene productos; puedes desactivarla"
    );
    marcas.delete(marcas.findById(id).orElseThrow(() -> no("Marca")));
  }

  private ResponseStatusException no(String n) {
    return new ResponseStatusException(
      HttpStatus.NOT_FOUND,
      n + " no encontrado"
    );
  }

  private ResponseStatusException conflicto(String n) {
    return new ResponseStatusException(HttpStatus.CONFLICT, n);
  }
}
