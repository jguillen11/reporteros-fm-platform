import { Pool } from "pg";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
    // Manejar GET (Listar noticias)
    if (req.method === "GET") {
        try {
            const { rows } = await pool.query(`
                SELECT id, title, category, content, image_url, created_at 
                FROM noticias 
                ORDER BY created_at DESC
            `);
            return res.status(200).json(rows);
        } catch (error) {
            console.error("Error GET:", error);
            return res.status(500).json({ error: "Error al obtener noticias" });
        }
    }

    // Manejar POST (Crear noticia)
    // En api/noticias/index.js (Sección POST)
    if (req.method === "POST") {
        try {
            // Vercel lee automáticamente el JSON y lo pone en req.body
            const { title, category, content, image_url } = req.body;

            if (!title || !content) {
                return res.status(400).json({ error: "Título y contenido requeridos" });
            }

            const query = `
            INSERT INTO noticias (title, category, content, image_url)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
            const values = [title, category, content, image_url || null];
            const { rows } = await pool.query(query, values);

            return res.status(201).json(rows[0]);
        } catch (error) {
            console.error("Database Error:", error);
            return res.status(500).json({ error: "Error al guardar en la base de datos" });
        }
    }

    // Si no es GET ni POST
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ message: `Método ${req.method} no permitido` });
}