import { test, expect } from "@playwright/test";

test("el descuento no deja un total negativo durante la compra", async function ({ page }) {
    await page.addInitScript(function () {
        localStorage.setItem("racing-garage-producto-seleccionado", "llantas-rs7");
    });

    page.on("dialog", async function (dialog) {
        await dialog.accept();
    });

    await page.goto("/producto.html");
    await expect(page.getByRole("heading", { name: "Llantas Forjadas RS-7" })).toBeVisible();

    await page.getByLabel("Cantidad").fill("2");
    await page.getByRole("button", { name: "Agregar al carrito" }).click();

    await page.goto("/carrito.html");
    await expect(page.locator(".item-carrito")).toHaveCount(1);

    await page.getByLabel("¿Tenés un código de descuento?").fill("PISTA2000");
    await page.getByRole("button", { name: "Aplicar" }).click();

    const resumen = page.locator(".resumen-pedido ul");
    await expect(resumen.locator("li").nth(0)).toContainText("2.498");
    await expect(resumen.locator("li").nth(2)).toContainText("2.000");
    await expect(resumen.locator("li").nth(3)).toContainText("498");

    const mensajeWhatsApp = await page.locator("#enviar-pedido-whatsapp").getAttribute("href");
    expect(decodeURIComponent(mensajeWhatsApp)).toContain("Total estimado: $ 498");

    const cantidad = page.locator(".input-cantidad");
    await cantidad.fill("1");
    await cantidad.press("Tab");

    await expect(resumen.locator("li").nth(0)).toContainText("1.249");
    await expect(resumen.locator("li").nth(2)).toContainText("1.249");
    await expect(resumen.locator("li").nth(3)).toContainText("$ 0");
    await expect(resumen.locator("li").nth(3)).not.toContainText("-");

    await page.getByRole("link", { name: "Proceder al pago" }).click();

    const resumenCheckout = page.locator(".resumen-lista");
    await expect(resumenCheckout.locator("li").nth(2)).toContainText("1.249");
    await expect(resumenCheckout.locator("li").nth(3)).toContainText("$ 0");
});
