
-- Base de datos: tienda_celulares

CREATE DATABASE IF NOT EXISTS tienda_celulares;
USE tienda_celulares;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'cajero') NOT NULL DEFAULT 'cajero',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de productos / inventario
CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio_compra DECIMAL(10,2),
    precio_venta DECIMAL(10,2),
    cantidad INT DEFAULT 0,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de ventas
CREATE TABLE IF NOT EXISTS ventas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT,
    cantidad INT,
    total DECIMAL(10,2),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- Tabla de reparaciones
CREATE TABLE IF NOT EXISTS reparaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descripcion TEXT,
    cliente_nombre VARCHAR(100),
    estado ENUM('pendiente', 'en_proceso', 'completado') DEFAULT 'pendiente',
    costo DECIMAL(10,2),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de facturas
CREATE TABLE IF NOT EXISTS facturas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    venta_id INT,
    total DECIMAL(10,2),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (venta_id) REFERENCES ventas(id)
);

-- Tabla de gastos
CREATE TABLE IF NOT EXISTS gastos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descripcion TEXT,
    monto DECIMAL(10,2),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de ingresos
CREATE TABLE IF NOT EXISTS ingresos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descripcion TEXT,
    monto DECIMAL(10,2),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de log de movimientos
CREATE TABLE IF NOT EXISTS log_movimientos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(50),
    descripcion TEXT,
    datos JSON,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
