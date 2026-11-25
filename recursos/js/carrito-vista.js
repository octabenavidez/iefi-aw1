// Renderiza el carrito y mantiene sincronizados cantidades, resumen y enlace de WhatsApp.
import {
    calcularDescuento,
    calcularTotal,
    CLAVE_CUPON,
    guardarCarrito,
    guardarCodigoDescuento,
    leerCarrito,
    leerCodigoDescuento
} from "./carrito-datos.js";

let carrito = leerCarrito();

const contenedorProductos = document.querySelector(".carrito-productos");
const listaResumen = document.querySelector(".resumen-pedido ul");
const estadoCarrito = document.querySelector("#estado-carrito");
const enlaceWhatsApp = document.querySelector("#enviar-pedido-whatsapp");
const formularioCupon = document.querySelector("#formulario-cupon");
const campoCupon = document.querySelector("#codigo-cupon");
const mensajeCupon = document.querySelector("#mensaje-cupon");
const numeroWhatsApp = "5493511234567";
let codigoCupon = leerCodigoDescuento();
campoCupon.value = codigoCupon;

function calcularTotalConCupon() {
    const subtotal = calcularTotal(carrito);
    return subtotal - calcularDescuento(subtotal, codigoCupon);
}

function crearMensajePedido() {
    const detalleProductos = carrito.map(function (item) {
        const subtotal = item.precio * item.cantidad;
        return "• " + item.nombre + " x " + item.cantidad + " — $ " + subtotal.toLocaleString("es-AR");
    });

    return [
        "Hola, quiero consultar por este pedido de Racing Garage:",
        "",
        ...detalleProductos,
        "",
        ...(codigoCupon ? ["Código aplicado: " + codigoCupon] : []),
        "Total estimado: $ " + calcularTotalConCupon().toLocaleString("es-AR"),
        "¿Podrían confirmarme disponibilidad y cómo continuar?"
    ].join("\n");
}

function actualizarEnlaceWhatsApp() {
    const carritoTieneProductos = carrito.length > 0;

    enlaceWhatsApp.hidden = !carritoTieneProductos;
    if (!carritoTieneProductos) {
        enlaceWhatsApp.removeAttribute("href");
        return;
    }

    enlaceWhatsApp.href = "https://wa.me/" + numeroWhatsApp + "?text=" + encodeURIComponent(crearMensajePedido());
}

function crearFilaProducto(item) {
    const articulo = document.createElement("article");
    articulo.className = "item-carrito";

    const imagen = document.createElement("img");
    imagen.src = item.imagen;
    imagen.alt = item.nombre;
    imagen.loading = "lazy";

    const imagenContenedor = document.createElement("picture");
    imagenContenedor.appendChild(imagen);

    const informacion = document.createElement("div");
    informacion.className = "item-carrito-informacion";

    const nombre = document.createElement("h3");
    nombre.textContent = item.nombre;

    const precio = document.createElement("p");
    precio.className = "item-carrito-precio";
    precio.textContent = "Precio $ " + (item.precio * item.cantidad).toLocaleString("es-AR");
    informacion.append(nombre, precio);

    const controles = document.createElement("div");
    controles.className = "item-carrito-controles";

    const cantidadCampo = document.createElement("div");
    cantidadCampo.className = "item-carrito-cantidad";

    const idCantidad = "cantidad-" + item.id;
    const etiquetaCantidad = document.createElement("label");
    etiquetaCantidad.htmlFor = idCantidad;
    etiquetaCantidad.textContent = "Cantidad";

    const inputCantidad = document.createElement("input");
    inputCantidad.type = "number";
    inputCantidad.id = idCantidad;
    inputCantidad.className = "input-cantidad";
    inputCantidad.dataset.id = item.id;
    inputCantidad.value = item.cantidad;
    inputCantidad.min = "1";
    inputCantidad.step = "1";
    inputCantidad.inputMode = "numeric";

    cantidadCampo.append(etiquetaCantidad, inputCantidad);

    const botonEliminar = document.createElement("button");
    botonEliminar.className = "boton-secundario boton-eliminar";
    botonEliminar.type = "button";
    botonEliminar.dataset.id = item.id;
    botonEliminar.setAttribute("aria-label", "Eliminar " + item.nombre + " del carrito");
    botonEliminar.textContent = "Eliminar";

    controles.append(cantidadCampo, botonEliminar);
    articulo.append(imagenContenedor, informacion, controles);
    return articulo;
}

function mostrarCarrito() {
    contenedorProductos.replaceChildren();

    if (carrito.length === 0) {
        const mensajeVacio = document.createElement("p");
        mensajeVacio.className = "carrito-vacio";
        mensajeVacio.textContent = "Tu carrito está vacío.";
        contenedorProductos.appendChild(mensajeVacio);
        estadoCarrito.textContent = "El carrito está vacío.";
    } else {
        estadoCarrito.textContent = "El carrito tiene " + carrito.length + (carrito.length === 1 ? " producto." : " productos.");
        carrito.forEach(function (item) {
            contenedorProductos.appendChild(crearFilaProducto(item));
        });
    }

    const subtotal = calcularTotal(carrito);
    const descuento = calcularDescuento(subtotal, codigoCupon);
    const total = subtotal - descuento;
    listaResumen.innerHTML = `
        <li><span>Subtotal</span><span>$ ${subtotal.toLocaleString("es-AR")}</span></li>
        <li><span>Envío</span><span>Gratis</span></li>
        ${descuento > 0 ? `<li><span>Descuento (${codigoCupon})</span><span>− $ ${descuento.toLocaleString("es-AR")}</span></li>` : ""}
        <li><span>Total</span><span>$ ${total.toLocaleString("es-AR")}</span></li>
    `;

    actualizarEnlaceWhatsApp();
}

formularioCupon.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const codigoIngresado = campoCupon.value.trim().toUpperCase();
    const subtotal = calcularTotal(carrito);
    const descuento = calcularDescuento(subtotal, codigoIngresado);

    if (descuento === 0) {
        mensajeCupon.dataset.estado = "error";
        mensajeCupon.textContent = "Ese código no es válido para este carrito.";
        campoCupon.value = codigoCupon;
        return;
    }

    codigoCupon = codigoIngresado;
    guardarCodigoDescuento(codigoCupon);
    mensajeCupon.dataset.estado = "exito";
    mensajeCupon.textContent = "¡Listo! Se descontaron $ " + descuento.toLocaleString("es-AR") + " del pedido.";
    mostrarCarrito();
});

contenedorProductos.addEventListener("change", function (evento) {
    if (!evento.target.classList.contains("input-cantidad")) {
        return;
    }

    const producto = carrito.find(function (item) {
        return item.id === evento.target.dataset.id;
    });
    const nuevaCantidad = Number.parseInt(evento.target.value, 10);

    if (!producto) {
        return;
    }

    if (!Number.isInteger(nuevaCantidad) || nuevaCantidad < 1) {
        evento.target.value = producto.cantidad;
        return;
    }

    producto.cantidad = nuevaCantidad;
    carrito = guardarCarrito(carrito);
    mostrarCarrito();
});

contenedorProductos.addEventListener("click", function (evento) {
    const botonEliminar = evento.target.closest(".boton-eliminar");
    if (!botonEliminar) {
        return;
    }

    carrito = carrito.filter(function (item) {
        return item.id !== botonEliminar.dataset.id;
    });
    if (carrito.length === 0) {
        codigoCupon = "";
        campoCupon.value = "";
        localStorage.removeItem(CLAVE_CUPON);
        mensajeCupon.textContent = "";
    }
    carrito = guardarCarrito(carrito);
    mostrarCarrito();
});

mostrarCarrito();
