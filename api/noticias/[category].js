import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
    const { category } = req.query;

    try {
        const { rows } = await pool.query(
            `SELECT * FROM noticias
       WHERE category = $1
       ORDER BY created_at DESC`,
            [category]
        );

        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener noticias" });
    }
}