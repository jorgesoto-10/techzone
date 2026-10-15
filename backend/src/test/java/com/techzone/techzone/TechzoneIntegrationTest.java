package com.techzone.techzone;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.*;
import com.techzone.techzone.config.DataInitializer;
import com.techzone.techzone.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class TechzoneIntegrationTest {

  @Autowired
  MockMvc mvc;

  @Autowired
  ObjectMapper json;

  @Autowired
  UsuarioRepository usuarios;

  @Autowired
  PasswordEncoder encoder;

  @Autowired
  DataInitializer initializer;

  @Autowired
  JdbcTemplate jdbc;

  String admin() throws Exception {
    return json
      .readTree(
        mvc
          .perform(
            post("/api/auth/login")
              .contentType(MediaType.APPLICATION_JSON)
              .content(
                "{\"correo\":\"admin@gmail.com\",\"password\":\"admin123\"}"
              )
          )
          .andExpect(status().isOk())
          .andReturn()
          .getResponse()
          .getContentAsString()
      )
      .get("token")
      .asText();
  }

  JsonNode cliente() throws Exception {
    return json.readTree(
      mvc
        .perform(
          post("/api/auth/registro")
            .contentType(MediaType.APPLICATION_JSON)
            .content(
              "{\"dniCliente\":\"12345678\",\"nombre\":\"Juan\",\"apellido\":\"Prueba\",\"correo\":\"juan@example.com\",\"telefono\":\"999999999\",\"password\":\"Prueba123\"}"
            )
        )
        .andExpect(status().isCreated())
        .andReturn()
        .getResponse()
        .getContentAsString()
    );
  }

  @Test
  void creaNueveTablasYNoDuplicaNiReemplazaLaClaveDelAdmin() throws Exception {
    String hash = usuarios
      .findByCorreoIgnoreCase("admin@gmail.com")
      .orElseThrow()
      .getPasswordHash();
    assertThat(encoder.matches("admin123", hash)).isTrue();
    initializer.run();
    assertThat(usuarios.count()).isEqualTo(1);
    assertThat(
      usuarios
        .findByCorreoIgnoreCase("admin@gmail.com")
        .orElseThrow()
        .getPasswordHash()
    ).isEqualTo(hash);
    assertThat(
      jdbc.queryForObject(
        "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='PUBLIC' AND TABLE_TYPE='BASE TABLE'",
        Integer.class
      )
    ).isEqualTo(9);
  }

  @Test
  void rolesSeActualizanEnServidorAunqueElJwtSeaAnterior() throws Exception {
    String root = admin();
    JsonNode user = cliente();
    String token = user.get("token").asText(),
      id = user.get("id").asText();
    mvc
      .perform(
        get("/api/admin/usuarios").header("Authorization", "Bearer " + token)
      )
      .andExpect(status().isForbidden());
    mvc
      .perform(
        put("/api/admin/usuarios/" + id + "/rol")
          .header("Authorization", "Bearer " + root)
          .contentType(MediaType.APPLICATION_JSON)
          .content("{\"rol\":\"ADMIN\"}")
      )
      .andExpect(status().isOk());
    mvc
      .perform(
        get("/api/admin/usuarios").header("Authorization", "Bearer " + token)
      )
      .andExpect(status().isOk());
    mvc
      .perform(
        put("/api/admin/usuarios/" + id + "/rol")
          .header("Authorization", "Bearer " + root)
          .contentType(MediaType.APPLICATION_JSON)
          .content("{\"rol\":\"CLIENTE\"}")
      )
      .andExpect(status().isOk());
    mvc
      .perform(
        get("/api/admin/usuarios").header("Authorization", "Bearer " + token)
      )
      .andExpect(status().isForbidden());
    assertThat(usuarios.count()).isEqualTo(2);
  }

  @Test
  void impideQuitarElUltimoAdminYElRegistroNoAceptaAdminDesdeElCliente()
    throws Exception {
    String token = admin();
    Long id = usuarios
      .findByCorreoIgnoreCase("admin@gmail.com")
      .orElseThrow()
      .getIdUsuario();
    mvc
      .perform(
        put("/api/admin/usuarios/" + id + "/rol")
          .header("Authorization", "Bearer " + token)
          .contentType(MediaType.APPLICATION_JSON)
          .content("{\"rol\":\"CLIENTE\"}")
      )
      .andExpect(status().isConflict());
    JsonNode u = cliente();
    mvc
      .perform(
        get("/api/admin/productos").header(
          "Authorization",
          "Bearer " + u.get("token").asText()
        )
      )
      .andExpect(status().isForbidden());
  }

  @Test
  void stockYDineroSeMantienenAlEditarConPrecioHistoricoYRechazarCompras()
    throws Exception {
    String root = admin(),
      user = cliente().get("token").asText();
    String product =
      "{\"nombreProducto\":\"Memoria de prueba\",\"sku\":\"TEST-1\",\"precio\":0.10,\"stock\":10,\"idCategoria\":1,\"idMarca\":1}";
    JsonNode p = json.readTree(
      mvc
        .perform(
          post("/api/admin/productos")
            .header("Authorization", "Bearer " + root)
            .contentType(MediaType.APPLICATION_JSON)
            .content(product)
        )
        .andExpect(status().isOk())
        .andReturn()
        .getResponse()
        .getContentAsString()
    );
    String pid = p.get("idProducto").asText();
    String compra =
      "{\"envio\":\"recojo\",\"items\":[{\"idProducto\":" +
      pid +
      ",\"cantidad\":2}]}";
    JsonNode v = json.readTree(
      mvc
        .perform(
          post("/api/ventas")
            .header("Authorization", "Bearer " + user)
            .contentType(MediaType.APPLICATION_JSON)
            .content(compra)
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.total").value(0.20))
        .andReturn()
        .getResponse()
        .getContentAsString()
    );
    mvc
      .perform(
        put("/api/admin/productos/" + pid)
          .header("Authorization", "Bearer " + root)
          .contentType(MediaType.APPLICATION_JSON)
          .content(product.replace("0.10", "0.99").replace("10,", "8,"))
      )
      .andExpect(status().isOk());
    mvc
      .perform(
        put(
          "/api/admin/ventas/" +
          v.get("idVenta").asText() +
          "/detalles/" +
          v.get("detalles").get(0).get("idDetalle").asText()
        )
          .header("Authorization", "Bearer " + root)
          .contentType(MediaType.APPLICATION_JSON)
          .content("{\"cantidad\":3}")
      )
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.subtotal").value(0.30));
    mvc
      .perform(get("/api/productos/" + pid))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.stock").value(7));
    mvc
      .perform(
        post("/api/ventas")
          .header("Authorization", "Bearer " + user)
          .contentType(MediaType.APPLICATION_JSON)
          .content(compra.replace("\"cantidad\":2", "\"cantidad\":0"))
      )
      .andExpect(status().isBadRequest());
    mvc
      .perform(
        post("/api/ventas")
          .header("Authorization", "Bearer " + user)
          .contentType(MediaType.APPLICATION_JSON)
          .content(compra.replace("\"cantidad\":2", "\"cantidad\":200"))
      )
      .andExpect(status().isConflict());
    assertThat(
      jdbc.queryForObject("SELECT COUNT(*) FROM venta", Integer.class)
    ).isEqualTo(1);
  }
}
