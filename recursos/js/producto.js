// Controla la carga del producto, sus especificaciones y el agregado al carrito.
import { URL_PRODUCTOS } from "./config.js";
import { obtenerDatos } from "./funciones.js";
import { guardarCarrito, leerCarrito, CLAVE_PRODUCTO_SELECCIONADO } from "./carrito-datos.js";

let productos = [];

const elementos = {
    titulo: document.querySelector(".detalle-producto h1"),
    imagen: document.querySelector(".detalle-producto picture img"),
    descripcion: document.querySelector(".detalle-producto > p"),
    especificaciones: document.querySelector(".detalle-producto > ul"),
    formulario: document.querySelector(".formulario-agregar"),
    cantidad: document.querySelector("#id-cantidad")
};

function buscarProducto(idProducto) {
    return productos.find(function (producto) {
        return producto.id === idProducto;
    }) || productos[0];
}

function mostrarDatosProducto(producto) {
    document.title = "Racing Garage - " + producto.nombre;
    elementos.titulo.textContent = producto.nombre;
    elementos.imagen.src = producto.imagen;
    elementos.imagen.alt = producto.nombre;
    elementos.descripcion.textContent = producto.descripcionLarga;

    mostrarEspecificaciones(producto);
}

function mostrarEspecificaciones(producto) {
    const lista = document.createDocumentFragment();

    producto.especificaciones.forEach(function (especificacion) {
        const item = document.createElement("li");
        item.textContent = especificacion;
        lista.appendChild(item);
    });

    const itemPrecio = document.createElement("li");
    itemPrecio.textContent = "Precio $ " + producto.precio.toLocaleString("es-AR");
    lista.appendChild(itemPrecio);

    elementos.especificaciones.replaceChildren(lista);
}

function agregarAlCarrito(producto, cantidad) {
    const carrito = leerCarrito();
    const productoEnCarrito = carrito.find(function (item) {
        return item.id === producto.id;
    });

    if (productoEnCarrito) {
        productoEnCarrito.cantidad += cantidad;
    } else {
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen: producto.imagen,
            cantidad: cantidad
        });
    }

    guardarCarrito(carrito);
}

function manejarEnvioFormulario(evento, producto) {
    evento.preventDefault();

    const cantidad = Number.parseInt(elementos.cantidad.value, 10);
    if (!Number.isInteger(cantidad) || cantidad < 1) {
        alert("La cantidad debe ser mayor a 0");
        return;
    }

    agregarAlCarrito(producto, cantidad);
    alert(cantidad + " unidad(es) de " + producto.nombre + " agregadas al carrito");
}

async function inicializarDetalleProducto() {
    productos = await obtenerDatos(URL_PRODUCTOS);

    if (!Array.isArray(productos) || productos.length === 0) {
        elementos.titulo.textContent = "No pudimos cargar el producto";
        elementos.descripcion.textContent = "Revisá tu conexión e intentá nuevamente.";
        elementos.formulario.hidden = true;
        return;
    }

    const idProducto = localStorage.getItem(CLAVE_PRODUCTO_SELECCIONADO);
    const producto = buscarProducto(idProducto);

    mostrarDatosProducto(producto);
    elementos.formulario.addEventListener("submit", function (evento) {
        manejarEnvioFormulario(evento, producto);
    });
}

inicializarDetalleProducto();
