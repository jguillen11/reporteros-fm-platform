// api/noticias/index.js - REEMPLAZA TODO EL CONTENIDO CON ESTO

import { Pool } from "pg";

let pool;
if (!global.pool) {
    global.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    });
}
pool = global.pool;

export default async function handler(req, res) {

    // Extraer ID si viene en la URL: /api/noticias/5
    const urlParts = req.url.split("?")[0].split("/").filter(Boolean);
    const lastPart = urlParts[urlParts.length - 1];
    const id = lastPart !== "noticias" ? lastPart : null;

    // ─── GET ────────────────────────────────────────────
    if (req.method === "GET") {
        try {
            if (id) {
                // GET /api/noticias/5 → por ID
                if (/^\d+$/.test(id)) {
                    const { rows } = await pool.query(
                        "SELECT * FROM noticias WHERE id = $1", [id]
                    );
                    if (rows.length === 0)
                        return res.status(404).json({ error: "Noticia no encontrada" });
                    return res.status(200).json(rows[0]);
                }
                // GET /api/noticias/Deportes → por categoría
                const { rows } = await pool.query(
                    "SELECT * FROM noticias WHERE category = $1 ORDER BY created_at DESC", [id]
                );
                return res.status(200).json(rows);
            }

            // GET /api/noticias → todas
            const { rows } = await pool.query(
                "SELECT id, title, category, content, image_url, created_at FROM noticias ORDER BY created_at DESC"
            );
            return res.status(200).json(rows);

        } catch (error) {
            console.error("Error GET:", error);
            return res.status(500).json({ error: "Error al obtener noticias" });
        }
    }

    // ─── POST ───────────────────────────────────────────
    if (req.method === "POST") {
        try {
            const { title, category, content, image_url, images } = req.body;
            if (!title || !content)
                return res.status(400).json({ error: "Título y contenido requeridos" });

            const { rows } = await pool.query(
                "INSERT INTO noticias (title, category, content, image_url, images) VALUES ($1, $2, $3, $4, $5) RETURNING *",
                [title, category, content, image_url || null, images || []]
            );
            return res.status(201).json(rows[0]);

        } catch (error) {
            console.error("Error POST:", error);
            return res.status(500).json({ error: "Error al guardar" });
        }
    }

    // ─── PUT ────────────────────────────────────────────
    if (req.method === "PUT") {
        if (!id || !/^\d+$/.test(id))
            return res.status(400).json({ error: "Se requiere ID numérico" });

        try {
            const { title, category, content, image_url, images } = req.body || {};
            if (!title)
                return res.status(400).json({ error: "Faltan datos obligatorios" });

            const { rows } = await pool.query(
                `UPDATE noticias SET title=$1, category=$2, content=$3, image_url=$4, images=$5, updated_at=NOW() WHERE id=$6 RETURNING *`,
                [title, category, content, image_url, images || [], id]
            );
            if (rows.length === 0)
                return res.status(404).json({ error: "No se pudo actualizar" });
            return res.status(200).json(rows[0]);

        } catch (error) {
            console.error("Error PUT:", error);
            return res.status(500).json({ error: error.message });
        }
    }

    // ─── DELETE ─────────────────────────────────────────
    if (req.method === "DELETE") {
        if (!id || !/^\d+$/.test(id))
            return res.status(400).json({ error: "Se requiere ID numérico" });

        try {
            await pool.query("DELETE FROM noticias WHERE id = $1", [id]);
            return res.status(200).json({ message: "Eliminada correctamente" });

        } catch (error) {
            console.error("Error DELETE:", error);
            return res.status(500).json({ error: error.message });
        }
    }

    res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
    return res.status(405).json({ message: `Método ${req.method} no permitido` });
}