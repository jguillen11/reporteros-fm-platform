import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
    const { slug } = req.query;

    try {
        // 1. GET: Lógica dual (ID o Categoría)
        if (req.method === 'GET') {
            const isId = /^\d+$/.test(slug); // Más seguro que isNaN
            if (isId) {
                const { rows } = await pool.query('SELECT * FROM noticias WHERE id = $1', [slug]);
                if (rows.length === 0) return res.status(404).json({ error: "Noticia no encontrada" });
                return res.status(200).json(rows[0]);
            } else {
                const { rows } = await pool.query(
                    'SELECT * FROM noticias WHERE category = $1 ORDER BY created_at DESC',
                    [slug]
                );
                return res.status(200).json(rows);
            }
        }

        // 2. PUT: Actualizar noticia
        if (req.method === 'PUT') {
            if (!/^\d+$/.test(slug)) return res.status(400).json({ error: "Se requiere ID numérico" });

            // Verificamos que el cuerpo no llegue vacío
            const { title, category, content, image_url } = req.body || {};
            if (!title) return res.status(400).json({ error: "Faltan datos obligatorios" });

            const query = `
                UPDATE noticias 
                SET title = $1, category = $2, content = $3, image_url = $4 
                WHERE id = $5 RETURNING *`;
            const { rows } = await pool.query(query, [title, category, content, image_url, slug]);

            if (rows.length === 0) return res.status(404).json({ error: "No se pudo actualizar" });
            return res.status(200).json(rows[0]);
        }

        // 3. DELETE: Borrar noticia
        if (req.method === 'DELETE') {
            if (!/^\d+$/.test(slug)) return res.status(400).json({ error: "Se requiere ID numérico" });
            await pool.query('DELETE FROM noticias WHERE id = $1', [slug]);
            return res.status(200).json({ message: "Eliminada correctamente" });
        }

        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });

    } catch (error) {
        console.error("Error en API:", error);
        // Devolvemos JSON siempre, incluso en error, para evitar el token '<'
        return res.status(500).json({ error: error.message });
    }
}