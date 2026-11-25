export async function obtenerDatos(url) {
    try {
        const respuesta = await fetch(url);

        if (!respuesta.ok) {
            throw new Error("No se pudieron cargar los productos.");
        }

        return await respuesta.json();
    } catch (error) {
        console.error("Error al obtener los productos:", error);
        return null;
    }
}
