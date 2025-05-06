// server.js
const express = require('express');
const mysql = require('mysql2/promise');
const app = express();
app.use(express.json());

const db = await mysql.createConnection({
  host: 'localhost',
  user: 'tu_usuario',
  password: 'tu_contraseña',
  database: 'tu_base_de_datos'
});

// Ruta para facturar
app.post('/facturar', async (req, res) => {
  const { idProducto, cantidadVendida } = req.body;

  const [rows] = await db.execute('SELECT cantidad FROM inventario WHERE id = ?', [idProducto]);

  if (!rows.length) {
    return res.status(404).json({ success: false, message: 'Producto no encontrado' });
  }

  const stock = rows[0].cantidad;
  if (stock < cantidadVendida) {
    return res.status(400).json({ success: false, message: 'Stock insuficiente' });
  }

  await db.execute('UPDATE inventario SET cantidad = cantidad - ? WHERE id = ?', [cantidadVendida, idProducto]);
  await db.execute('INSERT INTO facturas (id_producto, cantidad, fecha) VALUES (?, ?, NOW())', [idProducto, cantidadVendida]);

  res.json({ success: true, message: 'Factura generada y stock actualizado' });
});

app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});
