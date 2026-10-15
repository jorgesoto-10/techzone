-- Referencia del modelo V2. Spring Boot genera estas mismas nueve tablas al iniciar.
CREATE DATABASE IF NOT EXISTS techzone_v2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE techzone_v2;
CREATE TABLE IF NOT EXISTS usuario (
 id_usuario BIGINT AUTO_INCREMENT PRIMARY KEY, nombre VARCHAR(100) NOT NULL, apellido VARCHAR(100) NOT NULL,
 correo VARCHAR(150) NOT NULL UNIQUE, password_hash VARCHAR(255) NOT NULL, activo BOOLEAN NOT NULL DEFAULT TRUE,
 fecha_registro DATETIME(6) NOT NULL
);
CREATE TABLE IF NOT EXISTS rol (
 id_rol BIGINT AUTO_INCREMENT PRIMARY KEY, nombre VARCHAR(30) NOT NULL UNIQUE, descripcion VARCHAR(200)
);
CREATE TABLE IF NOT EXISTS usuario_rol (
 id_usuario_rol BIGINT AUTO_INCREMENT PRIMARY KEY, id_usuario BIGINT NOT NULL, id_rol BIGINT NOT NULL,
 fecha_asignacion DATETIME(6) NOT NULL, UNIQUE(id_usuario,id_rol),
 FOREIGN KEY(id_usuario) REFERENCES usuario(id_usuario), FOREIGN KEY(id_rol) REFERENCES rol(id_rol)
);
CREATE TABLE IF NOT EXISTS cliente (
 id_cliente BIGINT AUTO_INCREMENT PRIMARY KEY, id_usuario BIGINT NOT NULL UNIQUE, dni VARCHAR(8) NOT NULL UNIQUE,
 telefono VARCHAR(20), FOREIGN KEY(id_usuario) REFERENCES usuario(id_usuario)
);
CREATE TABLE IF NOT EXISTS categoria (
 id_categoria BIGINT AUTO_INCREMENT PRIMARY KEY, nombre_categoria VARCHAR(100) NOT NULL UNIQUE,
 descripcion VARCHAR(255), activo BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE TABLE IF NOT EXISTS marca (
 id_marca BIGINT AUTO_INCREMENT PRIMARY KEY, nombre VARCHAR(100) NOT NULL UNIQUE, activo BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE TABLE IF NOT EXISTS producto (
 id_producto BIGINT AUTO_INCREMENT PRIMARY KEY, id_categoria BIGINT NOT NULL, id_marca BIGINT NOT NULL,
 sku VARCHAR(50) NOT NULL UNIQUE, nombre_producto VARCHAR(150) NOT NULL, descripcion TEXT,
 precio DECIMAL(12,2) NOT NULL, stock INT NOT NULL, tipo VARCHAR(50), imagen_url VARCHAR(500),
 activo BOOLEAN NOT NULL DEFAULT TRUE, fecha_registro DATETIME(6) NOT NULL,
 CHECK(precio >= 0 AND stock >= 0), FOREIGN KEY(id_categoria) REFERENCES categoria(id_categoria),
 FOREIGN KEY(id_marca) REFERENCES marca(id_marca)
);
CREATE TABLE IF NOT EXISTS venta (
 id_venta BIGINT AUTO_INCREMENT PRIMARY KEY, numero_venta VARCHAR(40) NOT NULL UNIQUE,
 id_cliente BIGINT NOT NULL, fecha_venta DATETIME(6) NOT NULL, estado_venta VARCHAR(30) NOT NULL,
 estado_pago VARCHAR(30) NOT NULL, tipo_entrega VARCHAR(30) NOT NULL, direccion_entrega VARCHAR(255),
 total DECIMAL(12,2) NOT NULL, FOREIGN KEY(id_cliente) REFERENCES cliente(id_cliente)
);
CREATE TABLE IF NOT EXISTS detalle_venta (
 id_detalle_venta BIGINT AUTO_INCREMENT PRIMARY KEY, id_venta BIGINT NOT NULL, id_producto BIGINT NOT NULL,
 cantidad INT NOT NULL, precio_unitario DECIMAL(12,2) NOT NULL, subtotal DECIMAL(12,2) NOT NULL,
 UNIQUE(id_venta,id_producto), CHECK(cantidad > 0 AND precio_unitario >= 0 AND subtotal >= 0),
 FOREIGN KEY(id_venta) REFERENCES venta(id_venta), FOREIGN KEY(id_producto) REFERENCES producto(id_producto)
);
