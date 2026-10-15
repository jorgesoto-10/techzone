package com.techzone.techzone.config.jwt;

import com.techzone.techzone.repository.*;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

  private final JwtUtil jwt;
  private final UsuarioRepository usuarios;
  private final UsuarioRolRepository roles;

  public JwtAuthFilter(JwtUtil j, UsuarioRepository u, UsuarioRolRepository r) {
    jwt = j;
    usuarios = u;
    roles = r;
  }

  @Override
  protected void doFilterInternal(
    HttpServletRequest req,
    HttpServletResponse res,
    FilterChain chain
  ) throws ServletException, IOException {
    String h = req.getHeader("Authorization");
    if (h != null && h.startsWith("Bearer ")) try {
      Long id = jwt.usuario(h.substring(7));
      var u = usuarios.findById(id);
      if (u.isPresent() && u.get().isActivo()) {
        var authorities = roles
          .findByUsuario_IdUsuario(id)
          .stream()
          .map(x ->
            new SimpleGrantedAuthority("ROLE_" + x.getRol().getNombre())
          )
          .toList();
        SecurityContextHolder.getContext().setAuthentication(
          new UsernamePasswordAuthenticationToken(
            id.toString(),
            null,
            authorities
          )
        );
      }
    } catch (io.jsonwebtoken.JwtException | IllegalArgumentException ex) {
      SecurityContextHolder.clearContext();
    }
    chain.doFilter(req, res);
  }
}
