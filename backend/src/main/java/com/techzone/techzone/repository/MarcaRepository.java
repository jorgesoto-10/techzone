package com.techzone.techzone.repository;

import com.techzone.techzone.model.Marca;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MarcaRepository extends JpaRepository<Marca, Long> {
  Optional<Marca> findByNombreIgnoreCase(String nombre);
}
