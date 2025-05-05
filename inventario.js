// ===================== VARIABLES =====================
let inventario = JSON.parse(localStorage.getItem('inventario')) || [];
const formulario = document.getElementById('formularioInventario');
const tabla = document.getElementById('tablaInventario');
const buscador = document.getElementById('buscarInventario');
let editIndex = null;

// ===================== FUNCIONES =====================

function guardarInventario() {
  localStorage.setItem('inventario', JSON.stringify(inventario));
}

function limpiarFormulario() {
  formulario.reset();
  editIndex = null;
  formulario['btnGuardar'].textContent = 'Agregar';
}

function renderizarInventario(data = inventario) {
  tabla.innerHTML = '';
  if (data.length === 0) {
    tabla.innerHTML = '<tr><td colspan="9">No hay artículos registrados.</td></tr>';
    return;
  }

  data.forEach((item, index) => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${item.nombre}</td>
      <td>${item.marca || '-'}</td>
      <td>${item.modelo || '-'}</td>
      <td>${item.precio}</td>
      <td>${item.precioMayor || '-'}</td>
      <td>${item.imei || '-'}</td>
      <td>${item.descripcion || '-'}</td>
      <td>${item.stock || 0}</td> <!-- Mostrar stock -->
      <td>
        <button onclick="editarArticulo(${index})">✏️</button>
        <button onclick="eliminarArticulo(${index})">🗑️</button>
      </td>
    `;
    tabla.appendChild(fila);
  });
}

function agregarArticulo(e) {
  e.preventDefault();

  const nuevo = {
    nombre: formulario['nombre'].value.trim(),
    costo: formulario['costo'].value.trim(),
    precio: formulario['precio'].value.trim(),
    precioMayor: formulario['precioMayor'].value.trim(),
    modelo: formulario['modelo'].value.trim(),
    marca: formulario['marca'].value.trim(),
    imei: formulario['imei'].value.trim(),
    descripcion: formulario['descripcion'].value.trim(),
    stock: parseInt(formulario['stock'].value.trim()) || 0 // Obtener stock
  };

  if (!nuevo.nombre || !nuevo.costo || !nuevo.precio || !nuevo.stock) {
    alert('Nombre, Costo, Precio y Stock son obligatorios.');
    return;
  }

  if (nuevo.imei) {
    // Si tiene IMEI, buscar si ya existe en el inventario
    const existingIndex = inventario.findIndex(item => item.imei === nuevo.imei);
    if (existingIndex !== -1) {
      // Si el IMEI ya existe, solo aumentamos el stock
      inventario[existingIndex].stock += nuevo.stock;
    } else {
      // Si no existe el IMEI, agregamos el nuevo artículo
      inventario.push(nuevo);
    }
  } else {
    // Si no es un teléfono (sin IMEI), agregamos como artículo normal
    inventario.push(nuevo);
  }

  guardarInventario();
  limpiarFormulario();
  renderizarInventario();
}

function eliminarArticulo(index) {
  if (confirm('¿Estás seguro de eliminar este artículo?')) {
    inventario.splice(index, 1);
    guardarInventario();
    renderizarInventario();
  }
}

function editarArticulo(index) {
  const item = inventario[index];
  formulario['nombre'].value = item.nombre;
  formulario['costo'].value = item.costo;
  formulario['precio'].value = item.precio;
  formulario['precioMayor'].value = item.precioMayor || '';
  formulario['modelo'].value = item.modelo || '';
  formulario['marca'].value = item.marca || '';
  formulario['imei'].value = item.imei || '';
  formulario['descripcion'].value = item.descripcion || '';
  formulario['stock'].value = item.stock || ''; // Cargar stock en el formulario
  formulario['btnGuardar'].textContent = 'Actualizar';
  editIndex = index;
}

function buscarInventario() {
  const texto = buscador.value.toLowerCase();
  const resultado = inventario.filter(item =>
    item.nombre.toLowerCase().includes(texto) ||
    item.marca?.toLowerCase().includes(texto) ||
    item.modelo?.toLowerCase().includes(texto) ||
    item.imei?.toLowerCase().includes(texto) // Buscar por IMEI también
  );
  renderizarInventario(resultado);
}

// NUEVO: Función para actualizar el stock después de una factura
function actualizarStockProducto(nombreProducto, cantidadVendida, imei = null) {
  let producto = inventario.find(item => item.nombre === nombreProducto);

  if (!producto && imei) {
    // Si no se encontró por nombre, buscar por IMEI
    producto = inventario.find(item => item.imei === imei);
  }

  if (producto) {
    // Reducir la cantidad del producto
    producto.stock -= cantidadVendida;
    if (producto.stock < 0) producto.stock = 0; // Asegurarse de que no haya stock negativo
    guardarInventario();
    renderizarInventario();  // Volver a renderizar el inventario
  } else {
    alert('Producto no encontrado.');
  }
}

// ===================== EVENTOS =====================
formulario.addEventListener('submit', agregarArticulo);
buscador.addEventListener('input', buscarInventario);

// ===================== INICIAL =====================
renderizarInventario();
