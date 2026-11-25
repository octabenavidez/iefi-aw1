import { CLAVE_ULTIMO_PEDIDO } from "./carrito-datos.js";

const contenedor = document.querySelector("#resultado-confirmacion");
const pedidoGuardado = localStorage.getItem(CLAVE_ULTIMO_PEDIDO);

if (pedidoGuardado) {
    try {
        const pedido = JSON.parse(pedidoGuardado);

        if (!Array.isArray(pedido.productos)) {
            throw new Error("El pedido guardado no tiene productos.");
        }

        const titulo = document.createElement("h1");
        titulo.textContent = "¡Gracias por tu compra, " + pedido.nombre + "!";

        const mensaje = document.createElement("p");
        mensaje.textContent = "Tu pedido fue recibido y está siendo preparado.";

        const direccion = document.createElement("p");
        direccion.textContent = "Envío a: " + pedido.direccion;

        const listaProductos = document.createElement("ul");
        pedido.productos.forEach(function (producto) {
            const item = document.createElement("li");
            const subtotal = Number(producto.precio) * Number(producto.cantidad);
            item.textContent = producto.nombre + " x " + producto.cantidad + " — $ " + subtotal.toLocaleString("es-AR");
            listaProductos.appendChild(item);
        });

        const total = document.createElement("p");
        total.textContent = "Total del pedido: $ " + Number(pedido.total).toLocaleString("es-AR");

        const volver = document.createElement("a");
        volver.className = "boton-principal";
        volver.href = "./index.html";
        volver.textContent = "Volver al inicio";

        contenedor.replaceChildren(titulo, mensaje, direccion, listaProductos, total, volver);
    } catch (error) {
        console.error("No se pudo mostrar el pedido:", error);
        contenedor.textContent = "No se pudo cargar el detalle del pedido.";
    }
}
