// ingresos.js
document.addEventListener('DOMContentLoaded', () => {
    const formIngreso = document.getElementById('form-ingreso');
    const tablaIngresos = document.getElementById('tabla-ingresos').getElementsByTagName('tbody')[0];
    const filtroFechaIngreso = document.getElementById('filtro-fecha-ingreso');
    const btnFiltrarIngreso = document.getElementById('filtrar-ingreso');
  
    // Cargar ingresos desde LocalStorage
    function cargarIngresos() {
      let ingresos = JSON.parse(localStorage.getItem('ingresos')) || [];
      tablaIngresos.innerHTML = '';
      ingresos.forEach(ingreso => {
        const row = tablaIngresos.insertRow();
        row.innerHTML = `
          <td>${ingreso.descripcion}</td>
          <td>${ingreso.monto}</td>
          <td>${ingreso.fecha}</td>
          <td><button onclick="eliminarIngreso(${ingreso.id})">Eliminar</button></td>
        `;
      });
    }
  
    // Agregar un nuevo ingreso
    formIngreso.addEventListener('submit', (e) => {
      e.preventDefault();
      const descripcion = document.getElementById('descripcion-ingreso').value;
      const monto = document.getElementById('monto-ingreso').value;
      const fecha = document.getElementById('fecha-ingreso').value;
  
      if (!descripcion || !monto || !fecha) return;
  
      const ingresos = JSON.parse(localStorage.getItem('ingresos')) || [];
      const nuevoIngreso = {
        id: Date.now(),
        descripcion,
        monto,
        fecha
      };
      ingresos.push(nuevoIngreso);
      localStorage.setItem('ingresos', JSON.stringify(ingresos));
  
      formIngreso.reset();
      cargarIngresos();
    });
  
    // Eliminar un ingreso
    window.eliminarIngreso = (id) => {
      const ingresos = JSON.parse(localStorage.getItem('ingresos')) || [];
      const nuevosIngresos = ingresos.filter(ingreso => ingreso.id !== id);
      localStorage.setItem('ingresos', JSON.stringify(nuevosIngresos));
      cargarIngresos();
    };
  
    // Filtrar ingresos por fecha
    btnFiltrarIngreso.addEventListener('click', () => {
      const fechaFiltroIngreso = filtroFechaIngreso.value;
      let ingresos = JSON.parse(localStorage.getItem('ingresos')) || [];
  
      if (fechaFiltroIngreso) {
        ingresos = ingresos.filter(ingreso => ingreso.fecha === fechaFiltroIngreso);
      }
  
      tablaIngresos.innerHTML = '';
      ingresos.forEach(ingreso => {
        const row = tablaIngresos.insertRow();
        row.innerHTML = `
          <td>${ingreso.descripcion}</td>
          <td>${ingreso.monto}</td>
          <td>${ingreso.fecha}</td>
          <td><button onclick="eliminarIngreso(${ingreso.id})">Eliminar</button></td>
        `;
      });
    });
  
    cargarIngresos();
  });
  