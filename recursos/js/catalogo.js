// Script del catálogo: dibuja las tarjetas de los productos y filtra por marca y categoría

import { URL_PRODUCTOS } from "./config.js";
import { obtenerDatos } from "./funciones.js";
import { CLAVE_PRODUCTO_SELECCIONADO } from "./carrito-datos.js";

let productos = [];

// Elementos del HTML que vamos a usar
const contenedor = document.querySelector(".catalogo-productos");
const selectMarca = document.querySelector("#id-marca");
const selectCategoria = document.querySelector("#id-categoria");
const formularioFiltros = document.querySelector(".filtros-catalogo");
const estadoResultados = document.querySelector("#estado-resultados");

function anunciarCantidadResultados(cantidad) {
    if (cantidad === 0) {
        estadoResultados.textContent = "No se encontraron productos con esos filtros.";
        return;
    }

    const etiqueta = cantidad === 1 ? "producto" : "productos";
    estadoResultados.textContent = "Se encontraron " + cantidad + " " + etiqueta + ".";
}

// Función que recibe una lista de productos y los dibuja en el contenedor
function mostrarProductos(lista) {
    contenedor.innerHTML = "";

    if (lista.length === 0) {
        contenedor.innerHTML = "<p>No se encontraron productos con esos filtros.</p>";
        return;
    }

    lista.forEach(function (producto) {
        const tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta-producto";

        tarjeta.innerHTML = `
            <h3>${producto.nombre}</h3>
            <picture>
                <img src="${producto.imagen}" alt="${producto.nombre}">
            </picture>
            <p>${producto.descripcionCorta}</p>
            <ul>
                <li>${producto.caracteristica}</li>
                <li>Precio $ ${producto.precio.toLocaleString("es-AR")}</li>
            </ul>
            <a class="boton-principal" href="./producto.html" data-id="${producto.id}">Ver más</a>
        `;

        contenedor.appendChild(tarjeta);
    });
}

// Función que filtra los productos según los valores seleccionados en los desplegables
function filtrarProductos() {
    const marcaElegida = selectMarca.value;
    const categoriaElegida = selectCategoria.value;

    // Filtramos el array de productos manualmente
    const resultado = productos.filter(function (producto) {
        const coincideMarca = marcaElegida === "" || producto.marca === marcaElegida;
        const coincideCategoria = categoriaElegida === "" || producto.categoria === categoriaElegida;
        return coincideMarca && coincideCategoria;
    });

    mostrarProductos(resultado);
    anunciarCantidadResultados(resultado.length);
}

// Evento: cuando se envía el formulario de filtros aplicamos el filtro
formularioFiltros.addEventListener("submit", function (evento) {
    evento.preventDefault();
    filtrarProductos();
});

// Evento: también filtramos apenas cambia alguno de los selectores
selectMarca.addEventListener("change", filtrarProductos);
selectCategoria.addEventListener("change", filtrarProductos);

// Evento: cuando se hace click en "Ver más" guardamos el id del producto en localStorage
// y recién ahí dejamos que el link lleve a producto.html
contenedor.addEventListener("click", function (evento) {
    if (evento.target.tagName === "A") {
        const idProducto = evento.target.dataset.id;
        localStorage.setItem(CLAVE_PRODUCTO_SELECCIONADO, idProducto);
    }
});

async function inicializarCatalogo() {
    productos = await obtenerDatos(URL_PRODUCTOS);

    if (!Array.isArray(productos)) {
        contenedor.innerHTML = "<p>No se pudieron cargar los productos. Intentá de nuevo más tarde.</p>";
        estadoResultados.textContent = "No se pudieron cargar los productos.";
        return;
    }

    mostrarProductos(productos);
    anunciarCantidadResultados(productos.length);
}

inicializarCatalogo();
