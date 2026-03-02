import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
    const { slug } = req.query; // Puede ser un ID (2) o una categoría (Deportes)

    if (req.method === 'GET') {
        try {
            // LÓGICA DE DETECCIÓN:
            // Si slug es un número, buscamos por ID. Si no, buscamos por categoría.
            const isId = !isNaN(slug);

            if (isId) {
                // Caso: /api/noticias/2 (Obtener una noticia específica)
                const { rows } = await pool.query('SELECT * FROM noticias WHERE id = $1', [slug]);
                if (rows.length === 0) return res.status(404).json({ error: "Noticia no encontrada" });
                return res.status(200).json(rows[0]);
            } else {
                // Caso: /api/noticias/Deportes (Obtener noticias por categoría)
                const { rows } = await pool.query(
                    'SELECT * FROM noticias WHERE category = $1 ORDER BY created_at DESC', 
                    [slug]
                );
                return res.status(200).json(rows);
            }
        } catch (e) {
            return res.status(500).json({ error: e.message });
        }
    }

    // Los métodos PUT y DELETE solo deben funcionar si es un ID numérico
    if (req.method === 'PUT' || req.method === 'DELETE') {
        if (isNaN(slug)) return res.status(400).json({ error: "Se requiere un ID numérico" });

        try {
            if (req.method === 'PUT') {
                const { title, category, content, image_url } = req.body;
                const query = `
                    UPDATE noticias 
                    SET title = $1, category = $2, content = $3, image_url = $4 
                    WHERE id = $5 RETURNING *`;
                const { rows } = await pool.query(query, [title, category, content, image_url, slug]);
                return res.status(200).json(rows[0]);
            }

            if (req.method === 'DELETE') {
                await pool.query('DELETE FROM noticias WHERE id = $1', [slug]);
                return res.status(200).json({ message: "Eliminada correctamente" });
            }
        } catch (e) {
            return res.status(500).json({ error: e.message });
        }
    }

    return res.status(405).end(`Method ${req.method} Not Allowed`);
}