import { Pool } from "pg";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Método no permitido" });
    }

    try {
        const { rows } = await pool.query(`
            SELECT
                id,
                title,
                category,
                content,
                image_url,
                image_path,
                created_at,
                updated_at
            FROM noticias
            ORDER BY created_at DESC
        `);

        return res.status(200).json(rows);
    } catch (error) {
        console.error("Error al obtener noticias:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
}