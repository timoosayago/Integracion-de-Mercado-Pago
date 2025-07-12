const lista = document.getElementById("lista-carrito");
const total = document.getElementById("total-carrito");
const radioEnvio = document.querySelector("input[name='envio']");

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let totalFinal = 0;

function renderizarCarrito() {
  lista.innerHTML = "";
  totalFinal = 0;

  if (carrito.length === 0) {
    lista.innerHTML = "<p>Tu carrito está vacío.</p>";
    total.textContent = "0";
    return;
  }

  carrito.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "item-carrito";
    div.innerHTML = `
      <p><strong>${item.nombre}</strong></p>
      <p>Precio: $${item.precio}</p>
      <button onclick="eliminarItem(${index})">Eliminar</button>
    `;
    lista.appendChild(div);
    totalFinal += item.precio;
  });

  if (radioEnvio && radioEnvio.checked) {
    totalFinal += 3000;
  }

  total.textContent = totalFinal;
}

function eliminarItem(index) {
  carrito.splice(index, 1);
  localStorage.setItem("carrito", JSON.stringify(carrito));
  renderizarCarrito();
}

if (radioEnvio) {
  radioEnvio.addEventListener("change", renderizarCarrito);
}

// Confirmación de pedido
const form = document.querySelector(".formulario-envio");
if (form) {
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const datos = new FormData(form);
    const nombre = datos.get("nombre");
    const direccion = datos.get("direccion");
    const telefono = datos.get("telefono");
    const email = datos.get("email");

    alert(`Gracias ${nombre}!\nTu pedido será enviado a: ${direccion}.\nTe contactaremos al ${telefono} o ${email}.`);

    carrito = [];
    localStorage.removeItem("carrito");
    renderizarCarrito();
    form.reset();
  });
}

renderizarCarrito();
