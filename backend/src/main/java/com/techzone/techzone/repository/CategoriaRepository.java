package com.techzone.techzone.repository;

import com.techzone.techzone.model.Categoria;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
  Optional<Categoria> findByNombreCategoriaIgnoreCase(String nombre);
}
