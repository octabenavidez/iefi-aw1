export const CLAVE_CARRITO = "racing-garage-carrito";
export const CLAVE_CUPON = "racing-garage-cupon";
export const CLAVE_ULTIMO_PEDIDO = "racing-garage-ultimo-pedido";
export const CLAVE_PRODUCTO_SELECCIONADO = "racing-garage-producto-seleccionado";
export const CODIGO_DESCUENTO = "PISTA2000";
const MONTO_DESCUENTO = 2000;

export function leerCarrito() {
    const carritoGuardado = localStorage.getItem(CLAVE_CARRITO);

    if (!carritoGuardado) {
        return [];
    }

    try {
        const carrito = JSON.parse(carritoGuardado);

        if (!Array.isArray(carrito)) {
            return [];
        }

        return carrito.filter(function (item) {
            return item &&
                item.id &&
                item.nombre &&
                !isNaN(item.precio) &&
                Number(item.cantidad) >= 1;
        });
    } catch (error) {
        console.error("No se pudo leer el carrito guardado:", error);
        return [];
    }
}

export function guardarCarrito(carrito) {
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
    return carrito;
}

export function calcularTotal(carrito) {
    return carrito.reduce(function (total, item) {
        return total + Number(item.precio) * Number(item.cantidad);
    }, 0);
}

export function calcularDescuento(subtotal, codigo) {
    if (codigo.trim().toUpperCase() !== CODIGO_DESCUENTO) {
        return 0;
    }

    // return MONTO_DESCUENTO;
    return Math.min(Math.max(0, subtotal), MONTO_DESCUENTO);
}

export function calcularTotalFinal(carrito, codigo) {
    const subtotal = calcularTotal(carrito);
    return subtotal - calcularDescuento(subtotal, codigo);
}

export function leerCodigoDescuento() {
    return localStorage.getItem(CLAVE_CUPON) || "";
}

export function guardarCodigoDescuento(codigo) {
    localStorage.setItem(CLAVE_CUPON, codigo);
}
