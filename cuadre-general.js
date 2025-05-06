const { jsPDF } = window.jspdf;

document.addEventListener('DOMContentLoaded', function () {
  const fechaInput = document.getElementById('fecha-filtro');
  const btnFiltrar = document.getElementById('btn-filtrar');
  const btnPDF = document.getElementById('btn-pdf');
  const btnExcel = document.getElementById('btn-excel');

  let datosResumen = { ingresos: [], gastos: [], facturas: [], fecha: "" };

  // Reparar registros sin fecha
  function repararFechas(nombreLS, campoMonto = "monto") {
    let datos = JSON.parse(localStorage.getItem(nombreLS)) || [];
    let reparado = false;
    datos.forEach(d => {
      if (!d.fecha) {
        d.fecha = new Date().toISOString().slice(0, 10);
        reparado = true;
      }
      // Asegura que el monto sea numérico
      d[campoMonto] = parseFloat(d[campoMonto]) || 0;
    });
    if (reparado) {
      localStorage.setItem(nombreLS, JSON.stringify(datos));
    }
    return datos;
  }

  function cargarDatos(nombreLS) {
    return JSON.parse(localStorage.getItem(nombreLS)) || [];
  }

  function filtrarPorFecha(data, fecha) {
    return data.filter(item => item.fecha === fecha);
  }

  function renderLista(elementId, datos) {
    const lista = document.getElementById(elementId);
    lista.innerHTML = '';
    datos.forEach(d => {
      const texto = d.descripcion || d.concepto || d.id || 'Registro';
      const monto = parseFloat(d.monto || d.total || 0).toFixed(2);
      const li = document.createElement('li');
      li.textContent = `${texto} - $${monto}`;
      lista.appendChild(li);
    });
  }

  function sumarTotales(datos, campo = "monto") {
    return datos.reduce((acc, item) => acc + parseFloat(item[campo] || 0), 0);
  }

  function actualizarCuadre(fecha) {
    const ingresos = filtrarPorFecha(repararFechas('ingresos'), fecha);
    const gastos = filtrarPorFecha(repararFechas('gastos'), fecha);
    const facturas = filtrarPorFecha(repararFechas('facturas', 'total'), fecha);

    renderLista('lista-ingresos', ingresos);
    renderLista('lista-gastos', gastos);
    renderLista('lista-facturas', facturas);

    const totalIngresos = sumarTotales(ingresos, "monto");
    const totalGastos = sumarTotales(gastos, "monto");
    const totalFacturacion = sumarTotales(facturas, "total");
    const resumenFinal = totalIngresos + totalFacturacion - totalGastos;

    document.getElementById('total-ingresos').textContent = `$${totalIngresos.toFixed(2)}`;
    document.getElementById('total-gastos').textContent = `$${totalGastos.toFixed(2)}`;
    document.getElementById('total-facturacion').textContent = `$${totalFacturacion.toFixed(2)}`;
    document.getElementById('total-ganancias').textContent = `$${totalGanancias.toFixed(2)}`;
    document.getElementById('resumen-final').textContent = `$${resumenFinal.toFixed(2)}`;

    datosResumen = {
      fecha,
      ingresos, gastos, facturas,
      totalIngresos, totalGastos, totalFacturacion, resumenFinal
    };
  }

  // Exportar a PDF
  btnPDF.addEventListener('click', () => {
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(16);
    doc.text(`Cuadre del Día - ${datosResumen.fecha}`, 14, y); y += 10;

    doc.setFontSize(12);

    doc.text('INGRESOS:', 14, y); y += 8;
    datosResumen.ingresos.forEach(d => {
      doc.text(`- ${d.descripcion || d.concepto || d.id || 'Registro'}: $${parseFloat(d.monto).toFixed(2)}`, 18, y); y += 6;
    });
    doc.text(`Total Ingresos: $${datosResumen.totalIngresos.toFixed(2)}`, 18, y); y += 10;

    doc.text('GASTOS:', 14, y); y += 8;
    datosResumen.gastos.forEach(d => {
      doc.text(`- ${d.descripcion || d.concepto || d.id || 'Registro'}: $${parseFloat(d.monto).toFixed(2)}`, 18, y); y += 6;
    });
    doc.text(`Total Gastos: $${datosResumen.totalGastos.toFixed(2)}`, 18, y); y += 10;

    doc.text('FACTURACIÓN:', 14, y); y += 8;
    datosResumen.facturas.forEach(d => {
      doc.text(`- Factura ${d.id}: $${parseFloat(d.total).toFixed(2)}`, 18, y); y += 6;
    });
    doc.text(`Total Facturación: $${datosResumen.totalFacturacion.toFixed(2)}`, 18, y); y += 10;

    doc.text('GANANCIAS:', 14, y); y += 8;
    datosResumen.ganancias.forEach(d => {
      doc.text(`- Ganancias ${d.id}: $${parseFloat(d.total).toFixed(2)}`, 18, y); y += 6;
    });
    doc.text(`Total Ganancias: $${datosResumen.totalGanancias.toFixed(2)}`, 18, y); y += 10;


    doc.setFontSize(14);
    doc.text(`Resumen Final: $${datosResumen.resumenFinal.toFixed(2)}`, 14, y);

    doc.save(`cuadre_${datosResumen.fecha}.pdf`);
  });

  // Exportar a Excel
  btnExcel.addEventListener('click', () => {
    const wb = XLSX.utils.book_new();

    function sheetData(titulo, data, campoMonto = "monto") {
      return [[titulo], ['Descripción', 'Monto'], ...data.map(d => [d.descripcion || d.concepto || d.id, d[campoMonto]])];
    }

    const ingresosWS = XLSX.utils.aoa_to_sheet(sheetData("Ingresos", datosResumen.ingresos));
    const gastosWS = XLSX.utils.aoa_to_sheet(sheetData("Gastos", datosResumen.gastos));
    const facturasWS = XLSX.utils.aoa_to_sheet(sheetData("Facturación", datosResumen.facturas, "total"));

    XLSX.utils.book_append_sheet(wb, ingresosWS, "Ingresos");
    XLSX.utils.book_append_sheet(wb, gastosWS, "Gastos");
    XLSX.utils.book_append_sheet(wb, facturasWS, "Facturación");

    XLSX.writeFile(wb, `cuadre_${datosResumen.fecha}.xlsx`);
  });

  // Botón aplicar filtro
  btnFiltrar.addEventListener('click', () => {
    const fechaSeleccionada = fechaInput.value;
    if (fechaSeleccionada) {
      actualizarCuadre(fechaSeleccionada);
    } else {
      alert('Selecciona una fecha para aplicar el filtro.');
    }
  });

  // Al iniciar: cargar fecha de hoy
  const hoy = new Date().toISOString().slice(0, 10);
  fechaInput.value = hoy;
  actualizarCuadre(hoy);
});


document.getElementById("borrarHistorialFacturacion").addEventListener("click", () => {
  const confirmar = confirm("¿Estás seguro de que deseas borrar todo el historial de facturación?");
  if (confirmar) {
    localStorage.removeItem("facturas");
    alert("Historial de facturación borrado correctamente.");
    // Si tienes una función para renderizar el listado de facturas, llámala aquí.
    // renderizarFacturas();
  }
});


function mostrarGanancias() {
  const ganancias = JSON.parse(localStorage.getItem("ganancias")) || [];
  let total = 0;

  ganancias.forEach(g => {
    total += parseFloat(g.ganancia || 0);
  });

  document.getElementById("totalGanancias").textContent = `$${total.toFixed(2)}`;
}

const ganancias = JSON.parse(localStorage.getItem("ganancias")) || [];
const totalGanancias = ganancias.reduce((acc, g) => acc + g.ganancia, 0);

document.getElementById("gananciasValor").textContent = `$${totalGanancias.toFixed(2)}`;
