let reparaciones = JSON.parse(localStorage.getItem("reparaciones")) || [];
let reparacionActualId = null;

const formReparacion = document.getElementById("formReparacion");
const listaReparaciones = document.getElementById("listaReparaciones");
const modal = document.getElementById("modalTaller");
const closeModal = document.querySelector(".close");
const formTaller = document.getElementById("formTaller");
const productosAgregados = document.getElementById("productosAgregados");
const buscadorReparaciones = document.getElementById("buscadorReparaciones");
const reparacionSelect = document.getElementById("reparacionSelect");

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
  renderReparacionesEnSelect(); // también actualizamos el buscador
});

// Mostrar todas las reparaciones en tarjetas
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

// Abrir modal Taller y mostrar productos agregados
function abrirTaller(id) {
  reparacionActualId = id;
  modal.style.display = "block";
  productosAgregados.innerHTML = "";

  const reparacion = reparaciones.find(r => r.id === id);
  reparacion.productos.forEach((p, i) => {
    const div = document.createElement("div");
    div.innerHTML = `🔧 ${p.nombre} - $${p.costo}`;
    productosAgregados.appendChild(div);
  });

  // Mostrar seleccionada por defecto
  reparacionSelect.value = String(reparacion.id);
}

// Agregar producto a la reparación
formTaller.addEventListener("submit", (e) => {
  e.preventDefault();
  const nombre = document.getElementById("producto").value;
  const costo = Number(document.getElementById("costoProducto").value);
  const reparacion = reparaciones.find(r => r.id === reparacionActualId);
  reparacion.productos.push({ nombre, costo });
  localStorage.setItem("reparaciones", JSON.stringify(reparaciones));
  document.getElementById("producto").value = "";
  document.getElementById("costoProducto").value = "";
  abrirTaller(reparacionActualId);
});

// Buscador en tiempo real de reparaciones
function renderReparacionesEnSelect(filtro = "") {
  reparacionSelect.innerHTML = "<option value=''>Seleccione una reparación</option>";
  const filtroTexto = filtro.toLowerCase();

  const listaFiltrada = reparaciones
    .filter(r => r.estado === "En taller" || r.estado === "Lista")
    .map(r => {
      const matchText = `${r.cliente} ${r.equipo} ${r.id}`.toLowerCase();
      const prioridad = matchText.indexOf(filtroTexto);
      return { ...r, prioridad: prioridad === -1 ? 9999 : prioridad };
    })
    .sort((a, b) => a.prioridad - b.prioridad);

  listaFiltrada.forEach(r => {
    const option = document.createElement("option");
    option.value = String(r.id);
    option.textContent = `${r.equipo} (${r.cliente})`;
    reparacionSelect.appendChild(option);
  });
}

buscadorReparaciones.addEventListener("input", (e) => {
  renderReparacionesEnSelect(e.target.value);
});

// Cambiar estado Lista/Taller
function cambiarEstado(id) {
  const rep = reparaciones.find(r => r.id === id);
  rep.estado = rep.estado === "Lista" ? "En taller" : "Lista";
  localStorage.setItem("reparaciones", JSON.stringify(reparaciones));
  renderReparaciones();
  renderReparacionesEnSelect();
}

function eliminarReparacion(id) {
  if (confirm("¿Estás seguro de que deseas eliminar esta reparación?")) {
    reparaciones = reparaciones.filter(r => r.id !== id);
    localStorage.setItem("reparaciones", JSON.stringify(reparaciones));
    renderReparaciones();
    renderReparacionesEnSelect();
  }
}

// Modal edición
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

// Cerrar modales
closeModal.onclick = () => modal.style.display = "none";
closeEditar.onclick = () => modalEditar.style.display = "none";
window.onclick = (e) => {
  if (e.target === modal) modal.style.display = "none";
  if (e.target === modalEditar) modalEditar.style.display = "none";
};

// Inicialización
renderReparaciones();
renderReparacionesEnSelect();
