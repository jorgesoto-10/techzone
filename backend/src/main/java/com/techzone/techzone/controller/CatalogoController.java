package com.techzone.techzone.controller;

import com.techzone.techzone.dto.Datos.*;
import com.techzone.techzone.service.CatalogoService;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class CatalogoController {

  private final CatalogoService s;

  public CatalogoController(CatalogoService s) {
    this.s = s;
  }

  @GetMapping("/productos")
  public List<ProductoDTO> productos(
    @RequestParam(required = false) Long categoria,
    @RequestParam(required = false) String search
  ) {
    return s.productos(categoria, search, false);
  }

  @GetMapping("/productos/{id}")
  public ProductoDTO producto(@PathVariable Long id) {
    return s.producto(id);
  }

  @GetMapping("/categorias")
  public List<CategoriaDTO> categorias() {
    return s.categorias(false);
  }

  @GetMapping("/marcas")
  public List<MarcaDTO> marcas() {
    return s.marcas(false);
  }
}
