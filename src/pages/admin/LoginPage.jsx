import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserShield, FaSignInAlt, FaLock } from "react-icons/fa";
import { api } from "../../services/api";

function LoginPage() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // ---------------------------------------
    // 🔐 Enviar Login
    // ---------------------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // 1. IMPORTANTE: La ruta debe empezar con /api/ para que Vercel la reconozca
            // 2. No usamos res.ok ni res.json() aquí, porque tu servicio 'api' ya lo hace.
            const data = await api("/api/admin/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: form.username,
                    password: form.password,
                }),
            });

            // Si el backend responde con éxito (data ya es el JSON procesado)
            if (data.success) {
                // Guardar sesión - Usamos el ID del admin que devuelve tu login.js
                localStorage.setItem("admin_token", data.admin?.id || "logged_in");
                navigate("/admin/dashboard");
            } else {
                // Si el servidor responde pero con un error de negocio
                setError(data.message || "Credenciales incorrectas");
            }

        } catch (err) {
            // Si el fetch falla o res.ok es false, 'api.js' lanza un error que cae aquí
            console.error("Error capturado:", err.message);
            setError("Correo o contraseña incorrectos.");
        } finally {
            setLoading(false);
        }
    };

    // ---------------------------------------
    // ✏️ Inputs
    // ---------------------------------------
    const handleChange = (field, value) => {
        setForm({ ...form, [field]: value });
        if (error) setError("");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <form
                onSubmit={handleSubmit}
                className="bg-white w-full max-w-sm p-10 rounded-2xl shadow-xl"
            >
                {/* Encabezado */}
                <div className="flex flex-col items-center mb-8">
                    <FaUserShield className="text-4xl text-red-600 mb-3" />
                    <h2 className="text-3xl text-center font-extrabold text-gray-800">
                        Acceso Administrativo
                    </h2>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-center">
                        {error}
                    </div>
                )}

                {/* Email */}
                <div className="mb-6">
                    <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-red-500">
                        <span className="p-3 text-gray-400">
                            <FaSignInAlt />
                        </span>
                        <input
                            type="email"
                            placeholder="Correo"
                            className="w-full p-3 outline-none rounded-r-lg"
                            value={form.username}
                            onChange={(e) => handleChange("username", e.target.value)}
                            required
                        />
                    </div>
                </div>

                {/* Password */}
                <div className="mb-8">
                    <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-red-500">
                        <span className="p-3 text-gray-400">
                            <FaLock />
                        </span>
                        <input
                            type="password"
                            placeholder="Contraseña"
                            className="w-full p-3 outline-none rounded-r-lg"
                            value={form.password}
                            onChange={(e) => handleChange("password", e.target.value)}
                            required
                        />
                    </div>
                </div>

                {/* Botón */}
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full p-4 rounded-lg font-bold text-lg transition
                        ${loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-red-600 hover:bg-red-700 text-white"
                        }`}
                >
                    {loading ? "Ingresando..." : "Entrar"}
                </button>
            </form>
        </div>
    );
}

export default LoginPage;