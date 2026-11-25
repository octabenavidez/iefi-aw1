// Script del formulario de finalizar compra
// Valida los campos y si todo está bien guarda el pedido y redirige a confirmación
import {
    CLAVE_CARRITO,
    CLAVE_CUPON,
    CLAVE_ULTIMO_PEDIDO,
    calcularDescuento,
    calcularTotal,
    leerCarrito,
    leerCodigoDescuento
} from "./carrito-datos.js";

const formulario = document.querySelector(".formulario");
const listaResumen = document.querySelector(".resumen-lista");
const carritoInicial = leerCarrito();
const subtotalInicial = calcularTotal(carritoInicial);
const codigoCupon = leerCodigoDescuento();
const descuentoInicial = calcularDescuento(subtotalInicial, codigoCupon);
const totalInicial = subtotalInicial - descuentoInicial;

listaResumen.innerHTML = `
    <li><span>Subtotal</span><span>$ ${subtotalInicial.toLocaleString("es-AR")}</span></li>
    <li><span>Envío</span><span>Gratis</span></li>
    ${descuentoInicial > 0 ? `<li><span>Descuento (${codigoCupon})</span><span>− $ ${descuentoInicial.toLocaleString("es-AR")}</span></li>` : ""}
    <li><span>Total</span><span>$ ${totalInicial.toLocaleString("es-AR")}</span></li>
`;

formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    if (!formulario.checkValidity()) {
        formulario.reportValidity();
        return;
    }

    // Leemos los valores del formulario
    const nombre = document.querySelector("#id-nombre").value.trim();
    const email = document.querySelector("#id-email").value.trim();
    const telefono = document.querySelector("#id-telefono").value.trim();
    const direccion = document.querySelector("#id-direccion").value.trim();
    const ciudad = document.querySelector("#id-ciudad").value.trim();
    const codigoPostal = document.querySelector("#id-codigo-postal").value.trim();

    // Verificamos que no haya campos vacíos
    if (!nombre || !email || !telefono || !direccion || !ciudad || !codigoPostal) {
        alert("Por favor completá todos los campos antes de confirmar la compra.");
        return;
    }

    // Leemos el carrito del localStorage
    const carrito = leerCarrito();

    if (carrito.length === 0) {
        alert("Tu carrito está vacío. No podés confirmar una compra sin productos.");
        return;
    }

    // Calculamos el total
    const subtotal = calcularTotal(carrito);
    const descuento = calcularDescuento(subtotal, codigoCupon);
    const total = subtotal - descuento;

    // Creamos un objeto con los datos del pedido para mostrarlo en la confirmación
    const pedido = {
        nombre: nombre,
        direccion: direccion + ", " + ciudad + " (CP: " + codigoPostal + ")",
        codigoCupon: codigoCupon,
        descuento: descuento,
        total: total,
        productos: carrito
    };

    // Guardamos el pedido y vaciamos el carrito
    localStorage.setItem(CLAVE_ULTIMO_PEDIDO, JSON.stringify(pedido));
    localStorage.removeItem(CLAVE_CARRITO);
    localStorage.removeItem(CLAVE_CUPON);

    // Vamos a la página de confirmación
    window.location.href = "./confirmacion.html";
});
