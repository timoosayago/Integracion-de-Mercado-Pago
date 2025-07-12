let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

function agregarAlCarrito(nombre, precio, imagen = 'imagenes/placeholder.png') {
  const existente = carrito.find(p => p.nombre === nombre);
  if (existente) {
    existente.cantidad++;
  } else {
    carrito.push({ nombre, precio, cantidad: 1, imagen });
  }
  guardarCarrito();
  alert(`${nombre} fue agregado al carrito.`);
}

function renderizarCarrito() {
  const lista = document.getElementById("lista-carrito");
  const total = document.getElementById("total-carrito");
  const subtotal = document.getElementById("subtotal-carrito");
  const descuento = document.getElementById("descuento-carrito");

  lista.innerHTML = "";
  let subtotalFinal = 0;

  if (carrito.length === 0) {
    lista.innerHTML = "<p>Tu carrito está vacío.</p>";
    total.textContent = "0";
    subtotal.textContent = "0";
    descuento.textContent = "0";
    document.getElementById("finalizar-compra").disabled = true;
    return;
  }

  carrito.forEach((item, index) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <p><strong>${item.nombre}</strong></p>
      <p>Precio: $${item.precio}</p>
      <p>Cantidad: ${item.cantidad}</p>
      <button onclick="eliminarDelCarrito(${index})">Eliminar</button>
    `;
    lista.appendChild(div);
    subtotalFinal += item.precio * item.cantidad;
  });

  subtotal.textContent = subtotalFinal.toLocaleString('es-AR');
  actualizarTotal();
}

function eliminarDelCarrito(index) {
  carrito.splice(index, 1);
  guardarCarrito();
  renderizarCarrito();
}

function actualizarTotal() {
  const subtotal = parseFloat(document.getElementById("subtotal-carrito").textContent.replace(/\./g, '')) || 0;
  const envio = parseFloat(document.querySelector('input[name="envio"]:checked')?.value) || 0;
  const metodoPago = document.querySelector('input[name="pago"]:checked')?.value || 'transferencia';
  const cuotas = document.querySelector('input[name="cuotas"]:checked')?.value || '1';
  let interes = 1;
  let desc = 0;

  if (metodoPago === 'transferencia' || metodoPago === 'efectivo') {
    desc = subtotal * 0.04;
  } else if (metodoPago === 'tarjeta') {
    if (cuotas === '3') interes = 1.10;
    if (cuotas === '6') interes = 1.20;
    if (cuotas === '12') interes = 1.30;
  }

  const total = (subtotal * interes) + envio - desc;
  document.getElementById("descuento-carrito").textContent = desc.toLocaleString('es-AR');
  document.getElementById("total-carrito").textContent = total.toLocaleString('es-AR');
}

document.addEventListener("DOMContentLoaded", () => {
  renderizarCarrito();

  // mostrar cuotas si se selecciona tarjeta
  document.querySelectorAll('input[name="pago"]').forEach(radio => {
    radio.addEventListener("change", () => {
      const cuotas = document.getElementById("cuotas-options");
      if (radio.value === 'tarjeta') {
        cuotas.style.display = 'block';
      } else {
        cuotas.style.display = 'none';
      }
      actualizarTotal();
    });
  });

  document.querySelectorAll('input[name="cuotas"], input[name="envio"]').forEach(radio => {
    radio.addEventListener("change", actualizarTotal);
  });

  const formInputs = document.querySelectorAll('#formulario-envio input');
  formInputs.forEach(input => {
    input.addEventListener('input', () => {
      const filled = Array.from(formInputs).every(i => i.value.trim() !== '');
      document.getElementById("finalizar-compra").disabled = !filled;
    });
  });

  document.getElementById("finalizar-compra").addEventListener("click", async () => {
    if (carrito.length === 0) {
      alert("El carrito está vacío.");
      return;
    }

    const nombre = document.querySelector('input[name="nombre"]').value;
    const email = document.querySelector('input[name="email"]').value;
    const metodoEnvio = document.querySelector('input[name="envio"]:checked')?.dataset.method;
    const costoEnvio = parseFloat(document.querySelector('input[name="envio"]:checked')?.value) || 0;
    const cuotas = document.querySelector('input[name="cuotas"]:checked')?.value || '1';

    const subtotal = parseFloat(document.getElementById("subtotal-carrito").textContent.replace(/\./g, '')) || 0;
    const descuento = parseFloat(document.getElementById("descuento-carrito").textContent.replace(/\./g, '')) || 0;
    let interes = 1;
    if (cuotas === '3') interes = 1.10;
    if (cuotas === '6') interes = 1.20;
    if (cuotas === '12') interes = 1.30;
    const total = (subtotal * interes) + costoEnvio - descuento;

    const datos = {
      items: carrito.map(item => ({
        title: item.nombre,
        unit_price: item.precio,
        quantity: item.cantidad,
        currency_id: 'ARS'
      })),
      shipping: {
        cost: costoEnvio
      },
      payer: { name: nombre, email },
      total,
      back_urls: {
        success: window.location.origin + "/success.html",
        failure: window.location.origin + "/failure.html",
        pending: window.location.origin + "/pending.html"
      },
      auto_return: "approved"
    };

    try {
      const res = await fetch("/api/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
      });

      const result = await res.json();
      if (result.init_point) {
        window.location.href = result.init_point;
      } else {
        alert("No se pudo generar el link de pago.");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Error al conectar con el servidor.");
    }
  });

  const clearBtn = document.getElementById("clear-cart-btn");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      carrito = [];
      guardarCarrito();
      renderizarCarrito();
    });
  }
});
