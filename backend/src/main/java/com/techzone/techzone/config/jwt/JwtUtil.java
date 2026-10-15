package com.techzone.techzone.config.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.util.Date;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtUtil {

  @Value("${jwt.secret}")
  private String secret;

  @Value("${jwt.expiration-ms:28800000}")
  private long expiration;

  public String generar(Long id) {
    return Jwts.builder()
      .setIssuer("techzone-v2")
      .setSubject(id.toString())
      .setIssuedAt(new Date())
      .setExpiration(new Date(System.currentTimeMillis() + expiration))
      .signWith(
        Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret)),
        SignatureAlgorithm.HS256
      )
      .compact();
  }

  public Long usuario(String token) {
    return Long.valueOf(
      Jwts.parserBuilder()
        .requireIssuer("techzone-v2")
        .setSigningKey(Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret)))
        .build()
        .parseClaimsJws(token)
        .getBody()
        .getSubject()
    );
  }
}
