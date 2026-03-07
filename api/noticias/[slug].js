import { Pool } from 'pg';

// Reutilizar conexión
let pool;

if (!global.pool) {
    global.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
}

pool = global.pool;

export default async function handler(req, res) {

    const { slug } = req.query;

    if (!slug) {
        return res.status(400).json({ error: "Slug requerido" });
    }

    try {

        // GET: obtener noticia por ID o por categoría
        if (req.method === 'GET') {

            const isId = /^\d+$/.test(slug);

            if (isId) {

                const { rows } = await pool.query(
                    'SELECT * FROM noticias WHERE id = $1',
                    [slug]
                );

                if (rows.length === 0) {
                    return res.status(404).json({
                        error: "Noticia no encontrada"
                    });
                }

                return res.status(200).json(rows[0]);

            } else {

                const { rows } = await pool.query(
                    `SELECT *
                     FROM noticias
                     WHERE category = $1
                     ORDER BY created_at DESC`,
                    [slug]
                );

                return res.status(200).json(rows);
            }
        }

        // PUT: actualizar noticia
        if (req.method === 'PUT') {

            if (!/^\d+$/.test(slug)) {
                return res.status(400).json({
                    error: "Se requiere ID numérico"
                });
            }

            const { title, category, content, image_url } = req.body || {};

            if (!title) {
                return res.status(400).json({
                    error: "Faltan datos obligatorios"
                });
            }

            const query = `
                UPDATE noticias
                SET title = $1,
                    category = $2,
                    content = $3,
                    image_url = $4,
                    updated_at = NOW()
                WHERE id = $5
                RETURNING *
            `;

            const { rows } = await pool.query(query, [
                title,
                category,
                content,
                image_url,
                slug
            ]);

            if (rows.length === 0) {
                return res.status(404).json({
                    error: "No se pudo actualizar"
                });
            }

            return res.status(200).json(rows[0]);
        }

        // DELETE: borrar noticia
        if (req.method === 'DELETE') {

            if (!/^\d+$/.test(slug)) {
                return res.status(400).json({
                    error: "Se requiere ID numérico"
                });
            }

            await pool.query(
                'DELETE FROM noticias WHERE id = $1',
                [slug]
            );

            return res.status(200).json({
                message: "Eliminada correctamente"
            });
        }

        return res.status(405).json({
            error: `Method ${req.method} Not Allowed`
        });

    } catch (error) {

        console.error("Error en API:", error);

        return res.status(500).json({
            error: error.message
        });
    }
}