// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { CLAVE_CARRITO, CLAVE_PRODUCTO_SELECCIONADO, CODIGO_DESCUENTO } from "../recursos/js/carrito-datos.js";

afterEach(function () {
    localStorage.clear();
    document.body.innerHTML = "";
    vi.unstubAllGlobals();
    vi.resetModules();
});

async function cargarPagina(nombreArchivo) {
    const html = await readFile(resolve(nombreArchivo), "utf8");
    const pagina = new DOMParser().parseFromString(html, "text/html");
    document.body.innerHTML = pagina.body.innerHTML;
}

function enviarFormulario(formulario) {
    formulario.dispatchEvent(new Event("submit", {
        bubbles: true,
        cancelable: true
    }));
}

function leerResumen(selector) {
    return Array.from(document.querySelectorAll(selector + " li"))
        .map(function (fila) {
            return Array.from(fila.querySelectorAll("span"))
                .map(function (dato) {
                    return dato.textContent.trim();
                })
                .join(" ");
        })
        .join(" ");
}

describe("integración del descuento en el proceso de compra", function () {
    it("aplica el cupón al producto, limita el descuento y conserva el total al finalizar", async function () {
        const productosJson = await readFile(
            resolve("recursos/datos/productos.json"),
            "utf8"
        );
        const respuestaFetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async function () {
                return JSON.parse(productosJson);
            }
        });

        vi.stubGlobal("fetch", respuestaFetch);
        vi.stubGlobal("alert", vi.fn());
        localStorage.setItem(CLAVE_PRODUCTO_SELECCIONADO, "llantas-rs7");

        await cargarPagina("producto.html");
        await import("../recursos/js/producto.js?test-integracion");

        await vi.waitFor(function () {
            expect(document.querySelector(".detalle-producto > p").textContent)
                .toContain("Compatibles con la mayoría de vehículos");
        });

        expect(respuestaFetch).toHaveBeenCalledWith("./recursos/datos/productos.json");

        document.querySelector("#id-cantidad").value = "2";
        enviarFormulario(document.querySelector(".formulario-agregar"));

        const carritoGuardado = JSON.parse(localStorage.getItem(CLAVE_CARRITO));
        expect(carritoGuardado[0].id).toBe("llantas-rs7");
        expect(carritoGuardado[0].cantidad).toBe(2);

        await cargarPagina("carrito.html");
        await import("../recursos/js/carrito-vista.js?test-integracion");

        const campoCupon = document.querySelector("#codigo-cupon");
        campoCupon.value = "pista2000";
        enviarFormulario(document.querySelector("#formulario-cupon"));

        expect(leerResumen(".resumen-pedido ul")).toContain("Subtotal $ 2.498");
        expect(leerResumen(".resumen-pedido ul")).toContain("Descuento (PISTA2000) − $ 2.000");
        expect(leerResumen(".resumen-pedido ul")).toContain("Total $ 498");
        expect(localStorage.getItem("racing-garage-cupon")).toBe(CODIGO_DESCUENTO);

        const mensajeWhatsApp = new URL(document.querySelector("#enviar-pedido-whatsapp").href)
            .searchParams.get("text");
        expect(mensajeWhatsApp).toContain("Total estimado: $ 498");

        const cantidad = document.querySelector(".input-cantidad");
        cantidad.value = "1";
        cantidad.dispatchEvent(new Event("change", { bubbles: true }));

        expect(leerResumen(".resumen-pedido ul")).toContain("Subtotal $ 1.249");
        expect(leerResumen(".resumen-pedido ul")).toContain("Descuento (PISTA2000) − $ 1.249");
        expect(leerResumen(".resumen-pedido ul")).toContain("Total $ 0");
        expect(leerResumen(".resumen-pedido ul")).not.toContain("Total $ -");

        await cargarPagina("finalizar-compra.html");
        await import("../recursos/js/checkout.js?test-integracion");

        expect(leerResumen(".resumen-lista")).toContain("Descuento (PISTA2000) − $ 1.249");
        expect(leerResumen(".resumen-lista")).toContain("Total $ 0");
    });
});
