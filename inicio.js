document.addEventListener('DOMContentLoaded', function () {
    // Referencias a los botones
    const nuevoProductoBtn = document.querySelector('.btn:nth-child(1)');
    const nuevaVentaBtn = document.querySelector('.btn:nth-child(2)');
    const nuevaReparacionBtn = document.querySelector('.btn:nth-child(3)');
    const facturarBtn = document.querySelector('.btn:nth-child(4)');
    const registrarGastoBtn = document.querySelector('.btn:nth-child(5)');
    const registrarIngresoBtn = document.querySelector('.btn:nth-child(6)');
    const verCuadreBtn = document.querySelector('.btn:nth-child(7)');

    // Definir acciones para cada botón
    nuevoProductoBtn.addEventListener('click', function () {
        window.location.href = 'inventario.html'; // Redirige al módulo de inventario
    });

    nuevaVentaBtn.addEventListener('click', function () {
        window.location.href = 'ventas.html'; // Redirige al módulo de ventas
    });

    nuevaReparacionBtn.addEventListener('click', function () {
        window.location.href = 'reparaciones.html'; // Redirige al módulo de reparaciones
    });

    facturarBtn.addEventListener('click', function () {
        window.location.href = 'facturacion.html'; // Redirige al módulo de facturación
    });

    registrarGastoBtn.addEventListener('click', function () {
        window.location.href = 'gastos.html'; // Redirige al módulo de gastos
    });

    registrarIngresoBtn.addEventListener('click', function () {
        window.location.href = 'ingresos.html'; // Redirige al módulo de ingresos
    });

    verCuadreBtn.addEventListener('click', function () {
        window.location.href = 'cuadre_general.html'; // Redirige al módulo de cuadre general
    });
});

document.getElementById('inputImportarBackup').addEventListener('change', function (e) {
    const archivo = e.target.files[0];
    if (archivo) {
      importarRespaldo(archivo);
    }
  });
  

                                                                                              // base de datos //


  // Base de datos profesional para app tipo tienda de celulares usando IndexedDB

const DB_NAME = 'TiendaCelularesDB';
const DB_VERSION = 2;

let db;

function abrirBaseDeDatos() {
  const request = indexedDB.open(DB_NAME, DB_VERSION);

  request.onupgradeneeded = (event) => {
    db = event.target.result;

    // Crear almacenes si no existen
    if (!db.objectStoreNames.contains('inventario')) {
      const store = db.createObjectStore('inventario', { keyPath: 'id', autoIncrement: true });
      store.createIndex('nombre', 'nombre', { unique: false });
    }
    if (!db.objectStoreNames.contains('ventas')) {
      db.createObjectStore('ventas', { keyPath: 'id', autoIncrement: true });
    }
    if (!db.objectStoreNames.contains('reparaciones')) {
      db.createObjectStore('reparaciones', { keyPath: 'id', autoIncrement: true });
    }
    if (!db.objectStoreNames.contains('facturacion')) {
        db.createObjectStore('facturacion', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('gastos')) {
        db.createObjectStore('gastos', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('ingresos')) {
        db.createObjectStore('ingresos', { keyPath: 'id', autoIncrement: true });
      }
    if (!db.objectStoreNames.contains('cuadre general')) {
      db.createObjectStore('cuadre general', { keyPath: 'id', autoIncrement: true });
    }
    if (!db.objectStoreNames.contains('logMovimientos')) {
      db.createObjectStore('logMovimientos', { keyPath: 'id', autoIncrement: true });
    }
  };

  request.onsuccess = (event) => {
    db = event.target.result;
    console.log('Base de datos abierta con éxito');
  };

  request.onerror = (event) => {
    console.error('Error al abrir la base de datos', event);
  };
}

// Registrar cualquier movimiento en log
function registrarMovimiento(tipo, descripcion, datos) {
  const transaction = db.transaction(['logMovimientos'], 'readwrite');
  const log = transaction.objectStore('logMovimientos');
  log.add({
    fecha: new Date().toISOString(),
    tipo,
    descripcion,
    datos
  });
}

// Función general para operaciones CRUD
function guardarDato(storeName, data, accion = 'crear') {
  const transaction = db.transaction([storeName], 'readwrite');
  const store = transaction.objectStore(storeName);
  let request;

  if (accion === 'crear') {
    request = store.add(data);
  } else if (accion === 'editar') {
    request = store.put(data);
  } else if (accion === 'eliminar') {
    request = store.delete(data.id);
  }

  request.onsuccess = () => {
    console.log(`Acción ${accion} exitosa en ${storeName}`);
    registrarMovimiento(accion, `En ${storeName}`, data);
  };

  request.onerror = (event) => {
    console.error(`Error en acción ${accion} en ${storeName}`, event);
  };
}

// Leer todos los datos de un almacén
function leerDatos(storeName, callback) {
  const transaction = db.transaction([storeName], 'readonly');
  const store = transaction.objectStore(storeName);
  const request = store.getAll();

  request.onsuccess = () => {
    callback(request.result);
  };

  request.onerror = (event) => {
    console.error('Error al leer datos de', storeName, event);
  };
}

// Exportar respaldo como archivo JSON
function exportarRespaldo() {
  const respaldo = {};
  const almacenes = ['inventario', 'ventas', 'reparaciones', 'facturacion', 'gastos', 'ingresos', 'cuadre general', 'logMovimientos'];
  let pendientes = almacenes.length;

  almacenes.forEach(storeName => {
    leerDatos(storeName, (datos) => {
      respaldo[storeName] = datos;
      pendientes--;
      if (pendientes === 0) {
        const blob = new Blob([JSON.stringify(respaldo, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const fecha = new Date().toISOString().split('T')[0];
        a.href = url;
        a.download = `respaldo_tienda_${fecha}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  });
}

// Importar respaldo desde archivo JSON
function importarRespaldo(archivo) {
  const lector = new FileReader();
  lector.onload = (evento) => {
    try {
      const datos = JSON.parse(evento.target.result);
      const almacenes = Object.keys(datos);

      almacenes.forEach(storeName => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);

        datos[storeName].forEach(item => {
          store.put(item);
          registrarMovimiento('importado', `Desde respaldo a ${storeName}`, item);
        });
      });

      alert('Respaldo importado correctamente.');
    } catch (error) {
      console.error('Error al importar respaldo:', error);
      alert('Error al importar respaldo. Verifica el archivo.');
    }
  };
  lector.readAsText(archivo);
}

// Verificar respaldo actual y mostrar resumen en consola y en pantalla
function verificarRespaldoActual() {
  const almacenes = ['inventario', 'ventas', 'reparaciones', 'facturacion', 'gastos', 'ingresos', 'cuadre general', 'logMovimientos'];
  const resumen = {};
  let pendientes = almacenes.length;

  almacenes.forEach(storeName => {
    leerDatos(storeName, (datos) => {
      resumen[storeName] = datos.length;
      pendientes--;
      if (pendientes === 0) {
        console.log('Resumen de datos en la base de datos:', resumen);
        alert(`Resumen actual:\n\n` +
              `Inventario: ${resumen['inventario']} registros\n` +
              `Ventas: ${resumen['ventas']} registros\n` +
              `Reparaciones: ${resumen['reparaciones']} registros\n` +
              `Facturacion: ${resumen['Facturacion']} registros\n` +
              `Gastoss: ${resumen['Gastos']} registros\n` +
              `Ingresos: ${resumen['Ingresos']} registros\n` +
              `Cuadre general: ${resumen['cuadre general']} registros\n` +
              `Log de movimientos: ${resumen['logMovimientos']} registros`);
      }
    });
  });
}

// Inicializar
abrirBaseDeDatos();


function verificarBaseDeDatos() {
    const almacenes = ['inventario', 'ventas', 'reparaciones', 'facturacion', 'gastos', 'ingresos', 'cuadre general', 'logMovimientos'];
    const resultado = document.getElementById('resultadoVerificacion');
    resultado.innerHTML = '<strong>Cargando datos...</strong>';
    const datosRespaldo = {};
    let pendientes = almacenes.length;
  
    almacenes.forEach(storeName => {
      leerDatos(storeName, (datos) => {
        datosRespaldo[storeName] = datos;
        pendientes--;
        if (pendientes === 0) {
          resultado.innerHTML = `
            <pre>${JSON.stringify(datosRespaldo, null, 2)}</pre>
          `;
        }
      });
    });
  }
  