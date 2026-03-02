import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
    const { id } = req.query; // Vercel toma el ID de la URL automáticamente

    // 1. OBTENER UNA NOTICIA (Para que el formulario de edición cargue los datos)
    if (req.method === 'GET') {
        try {
            const { rows } = await pool.query('SELECT * FROM noticias WHERE id = $1', [id]);
            if (rows.length === 0) return res.status(404).json({ error: "No encontrada" });
            return res.status(200).json(rows[0]);
        } catch (e) {
            return res.status(500).json({ error: e.message });
        }
    }

    // 2. ACTUALIZAR NOTICIA (PUT)
    if (req.method === 'PUT') {
        try {
            const { title, category, content, image_url } = req.body;
            const query = `
                UPDATE noticias 
                SET title = $1, category = $2, content = $3, image_url = $4 
                WHERE id = $5 RETURNING *`;
            const { rows } = await pool.query(query, [title, category, content, image_url, id]);
            return res.status(200).json(rows[0]);
        } catch (e) {
            return res.status(500).json({ error: e.message });
        }
    }

    // 3. ELIMINAR NOTICIA (DELETE)
    if (req.method === 'DELETE') {
        try {
            await pool.query('DELETE FROM noticias WHERE id = $1', [id]);
            return res.status(200).json({ message: "Eliminada correctamente" });
        } catch (e) {
            return res.status(500).json({ error: e.message });
        }
    }

    // Si mandan otro método (POST, etc)
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}