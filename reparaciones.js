let reparaciones = JSON.parse(localStorage.getItem("reparaciones")) || [];
let productos = JSON.parse(localStorage.getItem("inventario")) || [];
let reparacionActualId = null;

// Referencias
const formReparacion = document.getElementById("formReparacion");
const listaReparaciones = document.getElementById("listaReparaciones");
const modal = document.getElementById("modalTaller");
const closeModal = document.querySelector(".close");
const formTaller = document.getElementById("formTaller");
const productosAgregados = document.getElementById("productosAgregados");
const buscadorReparaciones = document.getElementById("buscadorReparaciones");
const reparacionSelect = document.getElementById("reparacionSelect");
const productoInventarioSelect = document.getElementById("productoInventarioSelect");

// Guardar nueva reparación
formReparacion.addEventListener("submit", (e) => {
  e.preventDefault();
  const nueva = {
    id: Date.now(),
    cliente: document.getElementById("cliente").value,
    telefono: document.getElementById("telefono").value,
    equipo: document.getElementById("equipo").value,
    falla: document.getElementById("falla").value,
    abono: Number(document.getElementById("abono").value) || 0,
    productos: [],
    estado: "En taller"
  };
  reparaciones.push(nueva);
  localStorage.setItem("reparaciones", JSON.stringify(reparaciones));
  formReparacion.reset();
  renderReparaciones();
  renderReparacionesEnSelect();
});

// Mostrar reparaciones
function renderReparaciones() {
  listaReparaciones.innerHTML = "";
  reparaciones.forEach(rep => {
    const card = document.createElement("div");
    card.className = "reparacion-card";
    card.innerHTML = `
      <h4>${rep.equipo} - ${rep.cliente}</h4>
      <p><strong>Tel:</strong> ${rep.telefono}</p>
      <p><strong>Falla:</strong> ${rep.falla}</p>
      <p><strong>Abono:</strong> $${rep.abono.toFixed(2)}</p>
      <p><strong>Estado:</strong> ${rep.estado}</p>
      <button onclick="abrirTaller(${rep.id})">Agregar Producto</button>
      <button onclick="editarReparacion(${rep.id})">Editar</button>
      <button onclick="cambiarEstado(${rep.id})">
        ${rep.estado === 'Lista' ? 'Marcar como En Taller' : 'Marcar como Lista'}
      </button>
      <button onclick="eliminarReparacion(${rep.id})">Eliminar</button>
    `;
    listaReparaciones.appendChild(card);
  });
}

// Abrir modal taller
function abrirTaller(id) {
  reparacionActualId = id;
  modal.style.display = "block";
  productosAgregados.innerHTML = "";
  renderInventarioEnSelect();

  const reparacion = reparaciones.find(r => r.id === id);
  reparacion.productos.forEach(p => {
    const div = document.createElement("div");
    div.textContent = `🔧 ${p.nombre} - $${p.costo}`;
    productosAgregados.appendChild(div);
  });
}

// Rellenar select con productos del inventario
function renderInventarioEnSelect() {
  productos = JSON.parse(localStorage.getItem("inventario")) || [];
  productoInventarioSelect.innerHTML = "<option value=''>Seleccione un producto</option>";

  productos.forEach(p => {
    if (p.stock && p.stock > 0) {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = `${p.nombre} - Stock: ${p.stock}`;
      productoInventarioSelect.appendChild(opt);
    }
  });
}

// Agregar producto a reparación
formTaller.addEventListener("submit", (e) => {
  e.preventDefault();

  const productoId = document.getElementById("productoInventarioSelect").value;

  const costo = parseFloat(document.getElementById("costoProducto").value);

  if (!document.getElementById("productoInventarioSelect").value || isNaN(costo) || costo <= 0) {
    return alert("Selecciona un producto y un costo válido.");
  }
  
  const producto = productos.find(p => String(p.id) === productoId);

  if (!producto || producto.stock <= 0) {
    return alert("Producto no disponible en inventario.");
  }

  // Descontar 1 del stock
  producto.stock -= 1;

  const reparacion = reparaciones.find(r => r.id === reparacionActualId);
  reparacion.productos.push({ nombre: producto.nombre, costo });

  localStorage.setItem("reparaciones", JSON.stringify(reparaciones));
  localStorage.setItem("inventario", JSON.stringify(productos));
  document.getElementById("costoProducto").value = "";
  renderInventarioEnSelect();
  abrirTaller(reparacionActualId);
});

// Buscador de reparaciones
function renderReparacionesEnSelect(filtro = "") {
  reparacionSelect.innerHTML = "<option value=''>Seleccione una reparación</option>";
  const filtroTexto = filtro.toLowerCase();

  const listaFiltrada = reparaciones
    .filter(r => r.estado === "En taller" || r.estado === "Lista")
    .map(r => {
      const texto = `${r.cliente} ${r.equipo} ${r.id}`.toLowerCase();
      const prioridad = texto.indexOf(filtroTexto);
      return { ...r, prioridad: prioridad === -1 ? 9999 : prioridad };
    })
    .sort((a, b) => a.prioridad - b.prioridad);

  listaFiltrada.forEach(r => {
    const opt = document.createElement("option");
    opt.value = r.id;
    opt.textContent = `${r.equipo} (${r.cliente})`;
    reparacionSelect.appendChild(opt);
  });
}

buscadorReparaciones.addEventListener("input", (e) => {
  renderReparacionesEnSelect(e.target.value);
});

// Cambiar estado
function cambiarEstado(id) {
  const rep = reparaciones.find(r => r.id === id);
  rep.estado = rep.estado === "Lista" ? "En taller" : "Lista";
  localStorage.setItem("reparaciones", JSON.stringify(reparaciones));
  renderReparaciones();
  renderReparacionesEnSelect();
}

function eliminarReparacion(id) {
  if (confirm("¿Eliminar esta reparación?")) {
    reparaciones = reparaciones.filter(r => r.id !== id);
    localStorage.setItem("reparaciones", JSON.stringify(reparaciones));
    renderReparaciones();
    renderReparacionesEnSelect();
  }
}

// Modal de edición
let reparacionEditandoId = null;
const modalEditar = document.getElementById("modalEditar");
const closeEditar = document.querySelector(".close-editar");
const formEditar = document.getElementById("formEditar");

function editarReparacion(id) {
  const rep = reparaciones.find(r => r.id === id);
  reparacionEditandoId = id;

  document.getElementById("editCliente").value = rep.cliente;
  document.getElementById("editTelefono").value = rep.telefono;
  document.getElementById("editEquipo").value = rep.equipo;
  document.getElementById("editFalla").value = rep.falla;
  document.getElementById("editAbono").value = rep.abono;

  modalEditar.style.display = "block";
}

formEditar.addEventListener("submit", function (e) {
  e.preventDefault();
  const rep = reparaciones.find(r => r.id === reparacionEditandoId);
  rep.cliente = document.getElementById("editCliente").value;
  rep.telefono = document.getElementById("editTelefono").value;
  rep.equipo = document.getElementById("editEquipo").value;
  rep.falla = document.getElementById("editFalla").value;
  rep.abono = parseFloat(document.getElementById("editAbono").value) || 0;
  localStorage.setItem("reparaciones", JSON.stringify(reparaciones));
  modalEditar.style.display = "none";
  renderReparaciones();
  renderReparacionesEnSelect();
});

// Cierre de modales
closeModal.onclick = () => modal.style.display = "none";
closeEditar.onclick = () => modalEditar.style.display = "none";
window.onclick = (e) => {
  if (e.target === modal) modal.style.display = "none";
  if (e.target === modalEditar) modalEditar.style.display = "none";
};

// Inicializar
renderReparaciones();
renderReparacionesEnSelect();
