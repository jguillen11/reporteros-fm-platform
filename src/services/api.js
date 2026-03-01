// src/services/api.js

export const api = async (url, options = {}) => {
    const res = await fetch(url, {
        ...options,
    });

    if (!res.ok) {
        throw new Error("Error en la API");
    }
    
    return res.json();
};