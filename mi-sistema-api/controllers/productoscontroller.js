const db = require('../db');

exports.listar = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM productos");
  res.json(rows);
};

exports.crear = async (req, res) => {
  const { nombre, descripcion, precio_compra, precio_venta, cantidad } = req.body;
  await db.query("INSERT INTO productos (nombre, descripcion, precio_compra, precio_venta, cantidad) VALUES (?, ?, ?, ?, ?)", 
  [nombre, descripcion, precio_compra, precio_venta, cantidad]);
  res.status(201).json({ mensaje: "Producto agregado correctamente" });
};
