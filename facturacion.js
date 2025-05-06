let productos = JSON.parse(localStorage.getItem("inventario")) || [];
let reparaciones = JSON.parse(localStorage.getItem("reparaciones")) || [];

const productoSelect = document.getElementById("producto");
const reparacionSelect = document.getElementById("reparacion");
const productosSeleccionadosUl = document.getElementById("productosSeleccionados");
const totalFacturaSpan = document.getElementById("totalFactura");
const generarFacturaBtn = document.getElementById("generarFacturaBtn");
const vaciarFacturaBtn = document.getElementById("vaciarFacturaBtn");

let productosSeleccionados = [];
let totalFactura = 0;

// Renderizar productos
function renderizarProductos() {
  productoSelect.innerHTML = "<option value=''>Seleccione un producto</option>";
  productos = JSON.parse(localStorage.getItem("inventario")) || [];
  productos.forEach(p => {
    if (p.stock > 0) {
      const option = document.createElement("option");
      option.value = String(p.id);
      option.textContent = `${p.nombre} - $${p.precio}`;
      productoSelect.appendChild(option);
    }
  });
}

// Renderizar reparaciones
function renderizarReparaciones(filtro = "") {
  reparacionSelect.innerHTML = "<option value=''>Seleccione una reparación</option>";
  reparaciones = JSON.parse(localStorage.getItem("reparaciones")) || [];

  const filtroTexto = filtro.toLowerCase();
  const reparacionesFiltradas = reparaciones.filter(r => {
    const info = `${r.equipo} ${r.cliente} ${r.id}`.toLowerCase();
    return r.estado === "Lista" && info.includes(filtroTexto);
  });

  reparacionesFiltradas.forEach(r => {
    const option = document.createElement("option");
    option.value = String(r.id);
    const total = calcularCostoTotal(r);
    option.textContent = `${r.equipo} (${r.cliente}) - $${total}`;
    reparacionSelect.appendChild(option);
  });
}

// Calcular costo total de una reparación
function calcularCostoTotal(reparacion) {
  return reparacion.productos?.reduce((acc, p) => acc + parseFloat(p.costo || 0), 0) || 0;
}

// Agregar producto
function agregarProducto() {
  const productoId = productoSelect.value;
  if (!productoId) return alert("Selecciona un producto válido.");

  const producto = productos.find(p => String(p.id) === productoId);
  if (producto && producto.stock > 0) {
    productosSeleccionados.push({
      tipo: 'Producto',
      nombre: producto.nombre,
      precio: parseFloat(producto.precio)
    });
    actualizarFactura();
  } else {
    alert("Producto no disponible en inventario.");
  }
}

// Agregar reparación
function agregarReparacion() {
  const reparacionId = reparacionSelect.value;
  if (!reparacionId) return alert("Selecciona una reparación válida.");

  const reparacion = reparaciones.find(r => String(r.id) === reparacionId);
  if (reparacion) {
    const total = calcularCostoTotal(reparacion);
    productosSeleccionados.push({
      tipo: 'Reparación',
      equipo: reparacion.equipo,
      cliente: reparacion.cliente,
      telefono: reparacion.telefono,
      falla: reparacion.falla,
      abono: reparacion.abono,
      productos: reparacion.productos,
      precio: total
    });
    actualizarFactura();
  } else {
    alert("Reparación no encontrada.");
  }
}

// Agregar servicio a la factura
document.getElementById("formServicio").addEventListener("submit", function (e) {
  e.preventDefault();

  const nombre = document.getElementById("servicioCliente").value.trim();
  const descripcion = document.getElementById("servicioDescripcion").value.trim();
  const precio = parseFloat(document.getElementById("servicioPrecio").value);

  if (!nombre || !descripcion || isNaN(precio)) {
    return alert("Completa todos los campos del servicio correctamente.");
  }

  productosSeleccionados.push({
    tipo: "Servicio",
    nombre: `${descripcion} (${nombre})`,
    precio: precio
  });

  document.getElementById("formServicio").reset();
  actualizarFactura();
});

// Actualizar factura
function actualizarFactura() {
  productosSeleccionadosUl.innerHTML = "";
  totalFactura = 0;

  productosSeleccionados.forEach((item, index) => {
    const li = document.createElement("li");
    if (item.tipo === "Reparación") {
      li.textContent = `${item.tipo}: ${item.equipo} (${item.cliente}) - $${item.precio.toFixed(2)}`;
    } else {
      li.textContent = `${item.tipo}: ${item.nombre} - $${item.precio.toFixed(2)}`;
    }

    const eliminarBtn = document.createElement("button");
    eliminarBtn.textContent = "❌";
    eliminarBtn.onclick = () => {
      if (confirm(`¿Quitar este ítem de la factura?`)) {
        productosSeleccionados.splice(index, 1);
        actualizarFactura();
      }
    };

    li.appendChild(eliminarBtn);
    productosSeleccionadosUl.appendChild(li);
    totalFactura += item.precio;
  });

  totalFacturaSpan.textContent = totalFactura.toFixed(2);
}

// Vaciar factura completa
vaciarFacturaBtn.addEventListener("click", () => {
  if (productosSeleccionados.length === 0) return alert("La factura ya está vacía.");
  if (confirm("¿Seguro que deseas vaciar todos los ítems?")) {
    productosSeleccionados = [];
    totalFactura = 0;
    actualizarFactura();
  }
});

// Generar la factura
generarFacturaBtn?.addEventListener("click", () => {
  if (productosSeleccionados.length === 0) {
    return alert("Agrega productos, servicios o reparaciones antes de facturar.");
  }

  const fecha = new Date().toISOString().split("T")[0];
  const factura = {
    id: Date.now(),
    fecha: fecha,
    items: productosSeleccionados,
    total: totalFactura,
    descripcion: productosSeleccionados.map(p => p.nombre || p.equipo || "").join(", ")
  };

  const facturasGuardadas = JSON.parse(localStorage.getItem("facturas")) || [];
  facturasGuardadas.push(factura);
  localStorage.setItem("facturas", JSON.stringify(facturasGuardadas));

  let totalGanancia = 0;

productosSeleccionados.forEach(p => {
  if (p.tipo === "Producto") {
    const prod = productos.find(item => item.nombre === p.nombre);
    if (prod && prod.stock > 0) {
      prod.stock -= 1;
      const ganancia = parseFloat(p.precio) - parseFloat(prod.costo || 0);
      totalGanancia += ganancia;
    }
  }

  if (p.tipo === "Reparación") {
    const costo = (p.productos || []).reduce((acc, prod) => acc + (parseFloat(prod.costo) || 0), 0);
    const ganancia = p.precio - costo;
    totalGanancia += ganancia;
    reparaciones = reparaciones.filter(r => !(r.equipo === p.equipo && r.cliente === p.cliente));
  }
});

const ganancias = JSON.parse(localStorage.getItem("ganancias")) || [];
ganancias.push({
  fecha: factura.fecha,
  facturaId: factura.id,
  ganancia: totalGanancia
});
localStorage.setItem("ganancias", JSON.stringify(ganancias));


  // 🟠 Actualizar inventario y reparaciones
  productosSeleccionados.forEach(p => {
    if (p.tipo === "Producto") {
      const prod = productos.find(item => item.nombre === p.nombre);
      if (prod && prod.stock > 0) prod.stock -= 1;
    }
    if (p.tipo === "Reparación") {
      reparaciones = reparaciones.filter(r => !(r.equipo === p.equipo && r.cliente === p.cliente));
    }
  });

  localStorage.setItem("inventario", JSON.stringify(productos));
  localStorage.setItem("reparaciones", JSON.stringify(reparaciones));

  // 🧾 Generar PDF con jsPDF
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const logo = ''; // ⚠️ Reemplaza con tu logo en base64 si deseas usarlo

  try {
    if (logo) doc.addImage(logo, 'PNG', 14, 10, 30, 30);
  } catch (e) {
    console.warn("Logo no válido o no cargado.");
  }

  doc.setFontSize(16);
  doc.text("Factura de Venta", 105, 20, null, null, "center");

  doc.setFontSize(10);
  doc.text(`Fecha: ${factura.fecha}`, 150, 20);
  doc.text(`Factura #: ${factura.id}`, 150, 26);

  let y = 50;
  doc.setFontSize(12);
  doc.text("Detalle:", 14, y); y += 8;

  factura.items.forEach((p, i) => {
    if (p.tipo === "Reparación") {
      doc.text(`${i + 1}. Reparación de ${p.equipo} (${p.cliente})`, 20, y); y += 6;
      doc.text(`   Falla: ${p.falla}`, 22, y); y += 6;
      doc.text(`   Teléfono: ${p.telefono}`, 22, y); y += 6;
      if (p.abono) {
        doc.text(`   Abono: $${parseFloat(p.abono).toFixed(2)}`, 22, y); y += 6;
      }
      if (p.productos?.length) {
        doc.text(`   Productos utilizados:`, 22, y); y += 6;
        p.productos.forEach(prod => {
          doc.text(`   - ${prod.nombre} - $${prod.costo}`, 26, y); y += 6;
        });
      }
    } else {
      doc.text(`${i + 1}. ${p.tipo}: ${p.nombre}`, 20, y);
      doc.text(`$${p.precio.toFixed(2)}`, 180, y, null, null, "right");
      y += 8;
    }
  });

  y += 5;
  doc.line(14, y, 195, y); y += 7;

  doc.setFontSize(13);
  doc.text("TOTAL:", 140, y);
  doc.text(`$${factura.total.toFixed(2)}`, 180, y, null, null, "right");

  y += 20;
  doc.setFontSize(10);
  doc.text("Gracias por su compra", 14, y);
  doc.text("Alberto Services", 14, y + 6);
  doc.text("Tel: 809-555-1234", 14, y + 12);
  doc.text("Correo: contacto@albertoservices.com", 14, y + 18);
  doc.text("Dirección: Calle Principal #123", 14, y + 24);

  window.open(doc.output("bloburl"));

  // Reset
  productosSeleccionados = [];
  totalFactura = 0;
  actualizarFactura();
  renderizarProductos();
  renderizarReparaciones();

  alert("Factura generada con éxito.");
});


// Inicializar
window.onload = () => {
  renderizarProductos();
  renderizarReparaciones();
  actualizarFactura();
};

document.getElementById("agregarProductoBtn").addEventListener("click", agregarProducto);
document.getElementById("agregarReparacionBtn").addEventListener("click", agregarReparacion);
