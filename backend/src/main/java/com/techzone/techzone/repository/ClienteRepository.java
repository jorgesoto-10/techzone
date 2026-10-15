package com.techzone.techzone.repository;

import com.techzone.techzone.model.Cliente;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
  Optional<Cliente> findByDni(String dni);
  Optional<Cliente> findByUsuario_IdUsuario(Long id);
}
