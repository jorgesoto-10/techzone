package com.techzone.techzone.config;

import com.techzone.techzone.config.jwt.JwtAuthFilter;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.*;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.*;

@Configuration
public class SecurityConfig {

  @Bean
  PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  SecurityFilterChain chain(HttpSecurity http, JwtAuthFilter filter)
    throws Exception {
    return http
      .csrf(c -> c.disable())
      .cors(c -> {})
      .sessionManagement(s ->
        s.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
      )
      .authorizeHttpRequests(a ->
        a
          .requestMatchers(
            "/api/auth/cliente/login",
            "/api/auth/admin/login",
            "/api/auth/login",
            "/api/auth/registro",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/v3/api-docs/**",
            "/error"
          )
          .permitAll()
          .requestMatchers(
            HttpMethod.GET,
            "/api/productos/**",
            "/api/categorias/**",
            "/api/marcas/**"
          )
          .permitAll()
          .requestMatchers("/api/admin/**")
          .hasRole("ADMIN")
          .requestMatchers("/api/ventas/**")
          .hasRole("CLIENTE")
          .anyRequest()
          .authenticated()
      )
      .exceptionHandling(e ->
        e
          .authenticationEntryPoint((r, s, x) -> {
            s.setStatus(401);
            s.setContentType("application/json;charset=UTF-8");
            s
              .getWriter()
              .write("{\"mensaje\":\"Inicia sesión para continuar\"}");
          })
          .accessDeniedHandler((r, s, x) -> {
            s.setStatus(403);
            s.setContentType("application/json;charset=UTF-8");
            s
              .getWriter()
              .write("{\"mensaje\":\"No tienes permiso para esta operación\"}");
          })
      )
      .addFilterBefore(filter, UsernamePasswordAuthenticationFilter.class)
      .build();
  }

  @Bean
  CorsConfigurationSource cors(
    @Value("${app.cors.origin:http://localhost:5173}") String origins
  ) {
    CorsConfiguration c = new CorsConfiguration();
    c.setAllowedOrigins(
      Arrays.stream(origins.split(",")).map(String::trim).toList()
    );
    c.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    c.setAllowedHeaders(List.of("Authorization", "Content-Type"));
    UrlBasedCorsConfigurationSource source =
      new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", c);
    return source;
  }
}
