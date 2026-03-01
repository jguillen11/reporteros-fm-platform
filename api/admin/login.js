import bcrypt from "bcryptjs";
import { sql } from "@neondatabase/serverless";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Método no permitido" });
    }

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Datos incompletos" });
    }

    try {
        const result = await sql`
            SELECT * FROM admins WHERE email = ${email}
        `;

        const admin = result[0];
        if (!admin) {
            return res.status(401).json({ message: "Credenciales inválidas" });
        }

        const validPassword = await bcrypt.compare(password, admin.password);
        if (!validPassword) {
            return res.status(401).json({ message: "Credenciales inválidas" });
        }

        // Login OK
        return res.status(200).json({
            success: true,
            admin: {
                id: admin.id,
                email: admin.email,
                role: "admin"
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error del servidor" });
    }
}