package com.techzone.techzone.repository;

import com.techzone.techzone.model.Venta;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VentaRepository extends JpaRepository<Venta, Long> {
  List<Venta> findAllByOrderByFechaVentaDesc();
  List<Venta> findByCliente_IdClienteOrderByFechaVentaDesc(Long id);

  @org.springframework.data.jpa.repository.Lock(
    jakarta.persistence.LockModeType.PESSIMISTIC_WRITE
  )
  @org.springframework.data.jpa.repository.Query(
    "select v from Venta v where v.idVenta = :id"
  )
  Optional<Venta> bloquear(
    @org.springframework.data.repository.query.Param("id") Long id
  );
}
