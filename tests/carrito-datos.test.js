import { describe, expect, it } from "vitest";
import {
    calcularDescuento,
    calcularTotal,
    calcularTotalFinal,
    CODIGO_DESCUENTO
} from "../recursos/js/carrito-datos.js";

describe("calcularTotal", function () {
    it("devuelve 0 cuando el carrito está vacío", function () {
        expect(calcularTotal([])).toBe(0);
    });

    it("multiplica el precio por la cantidad", function () {
        const carrito = [
            { precio: 15000, cantidad: 2 }
        ];

        expect(calcularTotal(carrito)).toBe(30000);
    });

    it("suma los subtotales de todos los productos", function () {
        const carrito = [
            { precio: 15000, cantidad: 2 },
            { precio: 5000, cantidad: 3 }
        ];

        expect(calcularTotal(carrito)).toBe(45000);
    });

    it("aplica el descuento cuando el código es correcto", function () {
        const carrito = [{ precio: 5000, cantidad: 2 }];

        expect(calcularTotalFinal(carrito, CODIGO_DESCUENTO)).toBe(8000);
    });

    it("no aplica descuentos con un código incorrecto", function () {
        const carrito = [{ precio: 5000, cantidad: 2 }];

        expect(calcularTotalFinal(carrito, "OTROCODIGO")).toBe(10000);
        expect(calcularDescuento(10000, "OTROCODIGO")).toBe(0);
    });

    it("limita el descuento para que el total no quede negativo", function () {
        const carrito = [{ precio: 500, cantidad: 1 }];

        expect(calcularDescuento(500, CODIGO_DESCUENTO)).toBe(500);
        expect(calcularTotalFinal(carrito, CODIGO_DESCUENTO)).toBe(0);
    });
});
