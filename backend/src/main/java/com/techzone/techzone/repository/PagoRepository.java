package com.techzone.techzone.repository;

import com.techzone.techzone.model.Pago;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PagoRepository extends JpaRepository<Pago, Long> {

  Optional<Pago> findByVenta_IdVenta(Long idVenta);
}