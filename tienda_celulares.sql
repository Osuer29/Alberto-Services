
-- Base de datos para el sistema de tienda de celulares
CREATE DATABASE IF NOT EXISTS tienda_celulares;
USE tienda_celulares;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    rol ENUM('admin', 'caja') NOT NULL
);

-- Tabla de productos (inventario)
CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    cantidad INT NOT NULL
);

-- Tabla de reparaciones
CREATE TABLE IF NOT EXISTS reparaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente VARCHAR(100),
    equipo VARCHAR(100),
    telefono VARCHAR(20),
    falla TEXT,
    abono DECIMAL(10, 2),
    estado ENUM('En taller', 'Lista') DEFAULT 'En taller',
    costoTotal DECIMAL(10, 2) DEFAULT 0
);

-- Tabla de ventas
CREATE TABLE IF NOT EXISTS ventas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    total DECIMAL(10,2),
    usuario_id INT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabla de gastos
CREATE TABLE IF NOT EXISTS gastos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(255),
    monto DECIMAL(10,2),
    fecha DATE NOT NULL,
    usuario_id INT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabla de ingresos
CREATE TABLE IF NOT EXISTS ingresos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(255),
    monto DECIMAL(10,2),
    fecha DATE NOT NULL,
    usuario_id INT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabla de facturas
CREATE TABLE IF NOT EXISTS facturas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    descripcion TEXT,
    total DECIMAL(10,2),
    usuario_id INT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabla de log de movimientos
CREATE TABLE IF NOT EXISTS movimientos_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(50),
    descripcion TEXT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    usuario_id INT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabla inventario
CREATE TABLE inventario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100),
  cantidad INT,
  precio DECIMAL(10,2)
);

-- Tabla facturas
CREATE TABLE facturas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_producto INT,
  cantidad INT,
  fecha DATETIME,
  FOREIGN KEY (id_producto) REFERENCES inventario(id)
);
