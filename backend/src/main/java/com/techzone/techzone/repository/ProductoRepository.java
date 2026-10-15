package com.techzone.techzone.repository;

import com.techzone.techzone.model.Producto;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
  boolean existsBySkuIgnoreCase(String sku);
  boolean existsByCategoria_IdCategoria(Long id);
  boolean existsByMarca_IdMarca(Long id);

  @org.springframework.data.jpa.repository.Lock(
    jakarta.persistence.LockModeType.PESSIMISTIC_WRITE
  )
  @org.springframework.data.jpa.repository.Query(
    "select p from Producto p where p.idProducto = :id"
  )
  Optional<Producto> bloquear(
    @org.springframework.data.repository.query.Param("id") Long id
  );
}
