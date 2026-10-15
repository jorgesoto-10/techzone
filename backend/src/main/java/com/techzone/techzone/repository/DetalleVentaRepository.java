package com.techzone.techzone.repository;

import com.techzone.techzone.model.DetalleVenta;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DetalleVentaRepository
  extends JpaRepository<DetalleVenta, Long> {
  List<DetalleVenta> findByVenta_IdVentaOrderByIdDetalle(Long id);
  boolean existsByProducto_IdProducto(Long id);
  boolean existsByVenta_IdVentaAndProducto_IdProducto(
    Long venta,
    Long producto
  );
}
