import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Método no permitido" });
    }

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Datos incompletos" });
    }

    try {
        const sql = neon(process.env.DATABASE_URL);
        
        // Neon devuelve un array de objetos
        const result = await sql`SELECT * FROM admins WHERE email = ${email} LIMIT 1`;

        if (result.length === 0) {
            return res.status(401).json({ message: "Credenciales inválidas" });
        }

        const admin = result[0];
        const validPassword = await bcrypt.compare(password, admin.password);

        if (!validPassword) {
            return res.status(401).json({ message: "Credenciales inválidas" });
        }

        return res.status(200).json({
            success: true,
            admin: { id: admin.id, email: admin.email, role: "admin" }
        });

    } catch (error) {
        console.error("DETALLE DEL ERROR:", error);
        return res.status(500).json({ message: "Error de conexión", error: error.message });
    }
}