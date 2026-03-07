const BASE_URL = "/api";

export const api = async (url, options = {}) => {
    const res = await fetch(BASE_URL + url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

    if (!res.ok) {
        const contentType = res.headers.get("content-type");

        if (contentType && contentType.includes("text/html")) {
            const htmlError = await res.text();
            console.error("EL SERVIDOR DEVOLVIÓ HTML:", htmlError);
            throw new Error(`Error ${res.status}: ruta incorrecta ${BASE_URL + url}`);
        }

        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${res.status}`);
    }

    return res.json();
};