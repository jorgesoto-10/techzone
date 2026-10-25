package com.techzone.techzone.config;

import com.techzone.techzone.config.jwt.JwtAuthFilter;
import java.util.Arrays;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

  @Bean
  PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  UrlBasedCorsConfigurationSource corsConfigurationSource(
    @Value("${app.cors.origin:http://localhost:5173}")
    String origins
  ) {
    CorsConfiguration config = new CorsConfiguration();

    config.setAllowedOrigins(
      Arrays.stream(origins.split(","))
        .map(String::trim)
        .filter(origin -> !origin.isEmpty())
        .toList()
    );

    config.setAllowedMethods(
      List.of(
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "OPTIONS"
      )
    );

    config.setAllowedHeaders(
      List.of("Authorization", "Content-Type")
    );

    config.setAllowCredentials(true);
    config.setMaxAge(3600L);

    UrlBasedCorsConfigurationSource source =
      new UrlBasedCorsConfigurationSource();

    source.registerCorsConfiguration(
      "/**",
      config
    );

    return source;
  }

  @Bean
  SecurityFilterChain chain(
    HttpSecurity http,
    JwtAuthFilter filter,
    UrlBasedCorsConfigurationSource corsConfigurationSource
  ) throws Exception {

    return http
      .csrf(c -> c.disable())

      .cors(c ->
        c.configurationSource(
          corsConfigurationSource
        )
      )

      .sessionManagement(s ->
        s.sessionCreationPolicy(
          SessionCreationPolicy.STATELESS
        )
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

          // Negociación y transportes de SockJS.
          // El JWT y el rol se validan en STOMP.
          .requestMatchers(
            "/api/ws",
            "/api/ws/**"
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
          .authenticationEntryPoint(
            (request, response, exception) -> {
              response.setStatus(401);

              response.setContentType(
                "application/json;charset=UTF-8"
              );

              response.getWriter().write(
                "{\"mensaje\":\"Inicia sesión para continuar\"}"
              );
            }
          )

          .accessDeniedHandler(
            (request, response, exception) -> {
              response.setStatus(403);

              response.setContentType(
                "application/json;charset=UTF-8"
              );

              response.getWriter().write(
                "{\"mensaje\":\"No tienes permiso para esta operación\"}"
              );
            }
          )
      )

      .addFilterBefore(
        filter,
        UsernamePasswordAuthenticationFilter.class
      )

      .build();
  }
}