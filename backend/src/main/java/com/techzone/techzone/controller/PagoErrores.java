package com.techzone.techzone.controller;

import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

@RestControllerAdvice
public class PagoErrores {

  @ExceptionHandler(MaxUploadSizeExceededException.class)
  ResponseEntity<?> archivoGrande() {
    return ResponseEntity
      .status(413)
      .body(
        Map.of(
          "mensaje",
          "El comprobante debe pesar como máximo 5 MB"
        )
      );
  }
}