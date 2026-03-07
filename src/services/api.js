const BASE_URL = "/api";

export const api = async (url, options = {}) => {

    const res = await fetch(BASE_URL + url, {
        ...options,

        // ✅ CAMBIO 1: evitar caché (soluciona el 304)
        cache: "no-store",

        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

    if (!res.ok) {

        const contentType = res.headers.get("content-type");

        // ✅ CAMBIO 2: detectar si el servidor devolvió HTML
        if (contentType && contentType.includes("text/html")) {

            const htmlError = await res.text();

            console.error("EL SERVIDOR DEVOLVIÓ HTML:", htmlError);

            throw new Error(
                `Error ${res.status}: la API devolvió HTML en ${BASE_URL + url}`
            );
        }

        const errorData = await res.json().catch(() => ({}));

        throw new Error(
            errorData.error || `Error ${res.status}`
        );
    }

    return res.json();
};