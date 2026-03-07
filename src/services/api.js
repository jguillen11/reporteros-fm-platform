export const api = async (url, options = {}) => {
    const res = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

    // 1. Si la respuesta NO es exitosa
    if (!res.ok) {
        const contentType = res.headers.get("content-type");
        
        // Si el servidor nos mandó HTML (una página de error de Vercel)
        if (contentType && contentType.includes("text/html")) {
            const htmlError = await res.text();
            console.error("EL SERVIDOR DEVOLVIÓ HTML (Error de Ruta o Vercel):", htmlError);
            throw new Error(`Error ${res.status}: El servidor devolvió una página HTML en lugar de datos. Revisa la ruta: ${url}`);
        }

        // Si falló pero mandó un JSON de error (nuestro catch del backend)
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${res.status} en la API`);
    }

    // 2. Si todo salió bien, intentamos parsear el JSON
    try {
        return await res.json();
    } catch (parseError) {
        console.error("Error al parsear el JSON de éxito:", parseError);
        throw new Error("El servidor respondió OK pero el formato no es JSON válido.");
    }
};