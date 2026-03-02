import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
    // 1. Solo permitir peticiones GET
    if (req.method !== "GET") {
        res.setHeader("Allow", ["GET"]);
        return res.status(405).json({ error: `Método ${req.method} no permitido` });
    }

    const { category } = req.query;

    // 2. Validar que la categoría exista en la URL
    if (!category) {
        return res.status(400).json({ error: "La categoría es requerida" });
    }

    try {
        const { rows } = await pool.query(
            `SELECT 
                id, title, category, content, image_url, created_at 
             FROM noticias
             WHERE category = $1
             ORDER BY created_at DESC`,
            [category]
        );

        // 3. Siempre devolver un JSON, aunque esté vacío
        res.status(200).json(rows);

    } catch (error) {
        console.error("Error en [category].js:", error);
        res.status(500).json({ error: "Error interno al filtrar por categoría" });
    }
}