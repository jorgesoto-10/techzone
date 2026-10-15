package com.techzone.techzone.controller;

import java.util.Map;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class Errores {

  @ExceptionHandler(ResponseStatusException.class)
  ResponseEntity<?> regla(ResponseStatusException e) {
    return ResponseEntity.status(e.getStatusCode()).body(
      Map.of(
        "mensaje",
        e.getReason() == null ? "Solicitud inválida" : e.getReason()
      )
    );
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  ResponseEntity<?> validacion(MethodArgumentNotValidException e) {
    return ResponseEntity.badRequest().body(
        Map.of(
          "mensaje",
          e
            .getBindingResult()
            .getFieldErrors()
            .stream()
            .findFirst()
            .map(x -> x.getField() + ": " + x.getDefaultMessage())
            .orElse("Datos inválidos")
        )
      );
  }

  @ExceptionHandler(DataIntegrityViolationException.class)
  ResponseEntity<?> integridad() {
    return ResponseEntity.status(409).body(
      Map.of(
        "mensaje",
        "El registro ya existe o está relacionado con otros datos"
      )
    );
  }
}
