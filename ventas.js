document.addEventListener("DOMContentLoaded", () => {
    const tipoVenta = document.getElementById("tipoVenta");
    const detalleVenta = document.getElementById("detalleVenta");
    const formVenta = document.getElementById("formVenta");
    const ventasRegistradas = document.getElementById("ventasRegistradas");
    const buscador = document.getElementById("buscadorVentas");
  
    let ventas = JSON.parse(localStorage.getItem("ventas")) || [];
  
    tipoVenta.addEventListener("change", () => {
      let html = "";
      if (tipoVenta.value === "articulo") {
        html = `<input type="text" id="detalle" placeholder="Artículo vendido" required />`;
      } else if (tipoVenta.value === "reparacion") {
        html = `<input type="text" id="detalle" placeholder="Código reparación lista" required />`;
      } else if (tipoVenta.value === "servicio") {
        html = `<input type="text" id="detalle" placeholder="Detalle del servicio" required />`;
      }
      detalleVenta.innerHTML = html;
    });
  
    formVenta.addEventListener("submit", (e) => {
      e.preventDefault();
  
      const venta = {
        fecha: new Date().toLocaleString(),
        tipo: tipoVenta.value,
        cliente: document.getElementById("cliente").value,
        total: parseFloat(document.getElementById("total").value),
        detalle: document.getElementById("detalle").value,
        id: Date.now()
      };
  
      ventas.push(venta);
      localStorage.setItem("ventas", JSON.stringify(ventas));
      mostrarVentas();
      formVenta.reset();
      detalleVenta.innerHTML = "";
    });
  
    buscador.addEventListener("input", () => {
      const filtro = buscador.value.toLowerCase();
      const resultados = ventas.filter(v =>
        v.cliente.toLowerCase().includes(filtro) ||
        v.tipo.toLowerCase().includes(filtro)
      );
      mostrarVentas(resultados);
    });
  
    function mostrarVentas(lista = ventas) {
      ventasRegistradas.innerHTML = "";
      lista.forEach(venta => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td>${venta.fecha}</td>
          <td>${venta.tipo}</td>
          <td>${venta.cliente}</td>
          <td>$${venta.total.toFixed(2)}</td>
          <td>
            <button class="eliminar" onclick="eliminarVenta(${venta.id})">Eliminar</button>
          </td>
        `;
        ventasRegistradas.appendChild(fila);
      });
    }
  
    window.eliminarVenta = (id) => {
      ventas = ventas.filter(v => v.id !== id);
      localStorage.setItem("ventas", JSON.stringify(ventas));
      mostrarVentas();
    };
  
    mostrarVentas();
  });
  