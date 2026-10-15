package com.techzone.techzone.config;

import com.techzone.techzone.model.*;
import com.techzone.techzone.repository.*;
import com.techzone.techzone.service.CuentasService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataInitializer implements CommandLineRunner {

  private final RolRepository roles;
  private final UsuarioRepository usuarios;
  private final CategoriaRepository categorias;
  private final MarcaRepository marcas;
  private final CuentasService cuentas;
  private final PasswordEncoder encoder;

  public DataInitializer(
    RolRepository r,
    UsuarioRepository u,
    CategoriaRepository c,
    MarcaRepository m,
    CuentasService cs,
    PasswordEncoder e
  ) {
    roles = r;
    usuarios = u;
    categorias = c;
    marcas = m;
    cuentas = cs;
    encoder = e;
  }

  @Override
  @Transactional
  public void run(String... args) {
    for (String nombre : new String[] { "ADMIN", "CLIENTE" })
      if (roles.findByNombre(nombre).isEmpty()) {
        Rol r = new Rol();
        r.setNombre(nombre);
        r.setDescripcion(
          nombre.equals("ADMIN") ? "Administración de la tienda" : "Comprador"
        );
        roles.save(r);
      }
    if (usuarios.findByCorreoIgnoreCase("admin@gmail.com").isEmpty()) {
      Usuario u = new Usuario();
      u.setNombre("Administrador");
      u.setApellido("Techzone");
      u.setCorreo("admin@gmail.com");
      u.setPasswordHash(encoder.encode("admin123"));
      usuarios.save(u);
      cuentas.asignar(u, "ADMIN");
    }
    if (categorias.count() == 0) {
      String[] nombres = {
        "Adaptadores",
        "Almacenamiento",
        "Periféricos",
        "Case",
        "Cooler",
        "Fuentes de poder",
        "Memorias RAM",
        "Monitores",
        "Placas base",
        "Procesadores",
        "Tarjetas gráficas",
        "Laptops",
        "Computadoras",
      };
      for (String nombre : nombres) {
        Categoria c = new Categoria();
        c.setNombreCategoria(nombre);
        c.setDescripcion(nombre);
        categorias.save(c);
      }
    }
    if (marcas.count() == 0) for (String nombre : new String[] {
      "Sin especificar",
      "ASUS",
      "Kingston",
      "Logitech",
      "Lenovo",
      "Intel",
      "AMD",
      "MSI",
      "Samsung",
    }) {
      Marca m = new Marca();
      m.setNombre(nombre);
      marcas.save(m);
    }
  }
}
