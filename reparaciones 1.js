
let reparaciones = JSON.parse(localStorage.getItem("reparaciones")) || [];
let productos = JSON.parse(localStorage.getItem("inventario")) || [];
let reparacionActualId = null;

// DOM
const formReparacion = document.getElementById("formReparacion");
const listaReparaciones = document.getElementById("listaReparaciones");
const modal = document.getElementById("modalTaller");
const closeModal = document.querySelector(".close");
const formTaller = document.getElementById("formTaller");
const productosAgregados = document.getElementById("productosAgregados");

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

// Abrir modal Taller
function abrirTaller(id) {
  reparacionActualId = id;
  modal.style.display = "block";
  productosAgregados.innerHTML = "";

  renderInventarioEnSelect();

  const reparacion = reparaciones.find(r => r.id === id);
  reparacion.productos.forEach((p, i) => {
    const div = document.createElement("div");
    div.innerHTML = `🔧 ${p.nombre} - $${p.costo}`;
    productosAgregados.appendChild(div);
  });
}

function renderInventarioEnSelect() {
  const select = document.getElementById("productoInventarioSelect");
  select.innerHTML = "<option value=''>Seleccione un producto</option>";
  productos = JSON.parse(localStorage.getItem("inventario")) || [];
  productos.forEach(p => {
    if (p.stock > 0) {
      const option = document.createElement("option");
      option.value = p.id;
      option.textContent = `${p.nombre} - Stock: ${p.stock}`;
      select.appendChild(option);
    }
  });
}

// Agregar producto del inventario a reparación
formTaller.addEventListener("submit", (e) => {
  e.preventDefault();
  const productoId = parseInt(document.getElementById("productoInventarioSelect").value);
  const costo = parseFloat(document.getElementById("costoProducto").value);

  if (!productoId || isNaN(costo) || costo <= 0) {
    return alert("Selecciona un producto válido y costo mayor a 0.");
  }

  const producto = productos.find(p => p.id === productoId);
  if (!producto || producto.stock <= 0) {
    return alert("Producto no disponible en inventario.");
  }

  const reparacion = reparaciones.find(r => r.id === reparacionActualId);
  reparacion.productos.push({ nombre: producto.nombre, costo });
  producto.stock -= 1;

  localStorage.setItem("inventario", JSON.stringify(productos));
  localStorage.setItem("reparaciones", JSON.stringify(reparaciones));

  document.getElementById("costoProducto").value = "";
  document.getElementById("productoInventarioSelect").value = "";
  abrirTaller(reparacionActualId);
});

function cambiarEstado(id) {
  const rep = reparaciones.find(r => r.id === id);
  rep.estado = rep.estado === "Lista" ? "En taller" : "Lista";
  localStorage.setItem("reparaciones", JSON.stringify(reparaciones));
  renderReparaciones();
}

function eliminarReparacion(id) {
  if (confirm("¿Eliminar esta reparación?")) {
    reparaciones = reparaciones.filter(r => r.id !== id);
    localStorage.setItem("reparaciones", JSON.stringify(reparaciones));
    renderReparaciones();
  }
}

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
});

closeModal.onclick = () => (modal.style.display = "none");
closeEditar.onclick = () => (modalEditar.style.display = "none");

window.onclick = (e) => {
  if (e.target === modal) modal.style.display = "none";
  if (e.target === modalEditar) modalEditar.style.display = "none";
};

renderReparaciones();
