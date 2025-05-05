// gastos.js
document.addEventListener('DOMContentLoaded', () => {
    const formGasto = document.getElementById('form-gasto');
    const tablaGastos = document.getElementById('tabla-gastos').getElementsByTagName('tbody')[0];
    const filtroFecha = document.getElementById('filtro-fecha');
    const btnFiltrar = document.getElementById('filtrar');
  
    // Cargar gastos desde LocalStorage
    function cargarGastos() {
      let gastos = JSON.parse(localStorage.getItem('gastos')) || [];
      tablaGastos.innerHTML = '';
      gastos.forEach(gasto => {
        const row = tablaGastos.insertRow();
        row.innerHTML = `
          <td>${gasto.descripcion}</td>
          <td>${gasto.monto}</td>
          <td>${gasto.fecha}</td>
          <td><button onclick="eliminarGasto(${gasto.id})">Eliminar</button></td>
        `;
      });
    }
  
    // Agregar un nuevo gasto
    formGasto.addEventListener('submit', (e) => {
      e.preventDefault();
      const descripcion = document.getElementById('descripcion').value;
      const monto = document.getElementById('monto').value;
      const fecha = document.getElementById('fecha').value;
  
      if (!descripcion || !monto || !fecha) return;
  
      const gastos = JSON.parse(localStorage.getItem('gastos')) || [];
      const nuevoGasto = {
        id: Date.now(),
        descripcion,
        monto,
        fecha
      };
      gastos.push(nuevoGasto);
      localStorage.setItem('gastos', JSON.stringify(gastos));
  
      formGasto.reset();
      cargarGastos();
    });
  
    // Eliminar un gasto
    window.eliminarGasto = (id) => {
      const gastos = JSON.parse(localStorage.getItem('gastos')) || [];
      const nuevosGastos = gastos.filter(gasto => gasto.id !== id);
      localStorage.setItem('gastos', JSON.stringify(nuevosGastos));
      cargarGastos();
    };
  
    // Filtrar gastos por fecha
    btnFiltrar.addEventListener('click', () => {
      const fechaFiltro = filtroFecha.value;
      let gastos = JSON.parse(localStorage.getItem('gastos')) || [];
  
      if (fechaFiltro) {
        gastos = gastos.filter(gasto => gasto.fecha === fechaFiltro);
      }
  
      tablaGastos.innerHTML = '';
      gastos.forEach(gasto => {
        const row = tablaGastos.insertRow();
        row.innerHTML = `
          <td>${gasto.descripcion}</td>
          <td>${gasto.monto}</td>
          <td>${gasto.fecha}</td>
          <td><button onclick="eliminarGasto(${gasto.id})">Eliminar</button></td>
        `;
      });
    });
  
    cargarGastos();
  });
  