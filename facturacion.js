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
  productos.forEach(p => {
    const option = document.createElement("option");
    option.value = String(p.id);
    option.textContent = `${p.nombre} - $${p.precio}`;
    productoSelect.appendChild(option);
  });
}

// Renderizar reparaciones
function renderizarReparaciones(filtro = "") {
  reparacionSelect.innerHTML = "<option value=''>Seleccione una reparación</option>";

  const filtroTexto = filtro.toLowerCase();
  const reparacionesFiltradas = reparaciones.filter(r => {
    const info = `${r.equipo} ${r.cliente} ${r.id}`.toLowerCase();
    return r.estado === "Lista" && info.includes(filtroTexto);
  });

  reparacionesFiltradas.forEach(r => {
    const option = document.createElement("option");
    option.value = String(r.id);
    option.textContent = `${r.equipo} (${r.cliente}) - $${r.costoTotal}`;
    reparacionSelect.appendChild(option);
  });
}

// Agregar producto
function agregarProducto() {
  const productoId = productoSelect.value;
  if (!productoId) return alert("Selecciona un producto válido.");

  const producto = productos.find(p => String(p.id) === productoId);
  if (producto) {
    if (producto.cantidad <= 0) {
      return alert("Este producto no tiene stock disponible.");
    }

    productosSeleccionados.push({
      tipo: 'Producto',
      nombre: producto.nombre,
      precio: parseFloat(producto.precio)
    });
    actualizarFactura();
  }
}

// Agregar reparación
function agregarReparacion() {
  const reparacionId = reparacionSelect.value;
  if (!reparacionId) return alert("Selecciona una reparación válida.");

  const reparacion = reparaciones.find(r => String(r.id) === reparacionId);
  if (reparacion) {
    productosSeleccionados.push({
      tipo: 'Reparación',
      nombre: `${reparacion.equipo} (${reparacion.cliente})`,
      precio: parseFloat(reparacion.costoTotal)
    });
    actualizarFactura();
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

  // Reset form y actualizar
  document.getElementById("formServicio").reset();
  actualizarFactura();
});

// Actualizar factura
function actualizarFactura() {
  productosSeleccionadosUl.innerHTML = "";
  totalFactura = 0;

  productosSeleccionados.forEach((item, index) => {
    const li = document.createElement("li");
    li.textContent = `${item.tipo}: ${item.nombre} - $${item.precio.toFixed(2)}`;

    const eliminarBtn = document.createElement("button");
    eliminarBtn.textContent = "❌";
    eliminarBtn.style.marginLeft = "10px";
    eliminarBtn.style.background = "red";
    eliminarBtn.style.color = "white";
    eliminarBtn.style.border = "none";
    eliminarBtn.style.cursor = "pointer";

    eliminarBtn.onclick = () => {
      const confirmar = confirm(`¿Quitar "${item.nombre}" de la factura?`);
      if (confirmar) {
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
  const confirmar = confirm("¿Seguro que deseas vaciar todos los ítems?");
  if (confirmar) {
    productosSeleccionados = [];
    totalFactura = 0;
    actualizarFactura();
  }
});

// Generar la factura en PDF y guardar en historial
generarFacturaBtn.addEventListener("click", () => {
  if (productosSeleccionados.length === 0) {
    return alert("Por favor, agregue productos o reparaciones a la factura.");
  }

  const fecha = new Date().toISOString().split("T")[0];
  const factura = {
    id: Date.now(),
    fecha: fecha,
    items: productosSeleccionados,
    total: totalFactura,
    descripcion: productosSeleccionados.map(p => p.nombre).join(", ")
  };

  // ➕ Guardar en historial
  const facturasGuardadas = JSON.parse(localStorage.getItem("facturas")) || [];
  facturasGuardadas.push(factura);
  localStorage.setItem("facturas", JSON.stringify(facturasGuardadas));

  // 🔁 Actualizar inventario y reparaciones
  productosSeleccionados.forEach(p => {
    if (p.tipo === "Producto") {
      const producto = productos.find(prod => prod.nombre === p.nombre);
      if (producto && producto.cantidad > 0) {
        // Reducir el stock del producto
        producto.cantidad -= 1; // Puedes modificar este valor si estás vendiendo más de una unidad
      }
    }

    if (p.tipo === "Reparación") {
      // Si es una reparación, la eliminamos de la lista
      reparaciones = reparaciones.filter(r => r.equipo !== p.nombre);
    }
  });

  localStorage.setItem("inventario", JSON.stringify(productos));
  localStorage.setItem("reparaciones", JSON.stringify(reparaciones));

  // 📄 Generar PDF
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text('Factura de Venta', 14, 20);
  let y = 30;

  productosSeleccionados.forEach(p => {
    doc.setFontSize(12);
    doc.text(`${p.tipo}: ${p.nombre} - $${p.precio.toFixed(2)}`, 14, y);
    y += 10;
  });

  doc.text(`Total: $${totalFactura.toFixed(2)}`, 14, y);
  doc.save(`Factura_${factura.id}.pdf`);

  // 🔄 Reset
  productosSeleccionados = [];
  totalFactura = 0;
  actualizarFactura();
  renderizarProductos();
  renderizarReparaciones();

  alert("Factura generada y actualizaciones aplicadas correctamente.");
});

// Inicializar
window.onload = () => {
  renderizarProductos();
  renderizarReparaciones();
  actualizarFactura();
};

document.getElementById("agregarProductoBtn").addEventListener("click", agregarProducto);
document.getElementById("agregarReparacionBtn").addEventListener("click", agregarReparacion);
