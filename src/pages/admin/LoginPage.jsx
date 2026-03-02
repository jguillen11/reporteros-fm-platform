import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserShield, FaSignInAlt, FaLock } from "react-icons/fa";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function LoginPage() {
    const navigate = useNavigate();

    // Obtenemos el objeto de autenticación
    const auth = useAuth();

    // Blindaje: Extraemos login asegurándonos de que sea una función
    // Esto evita el error "c is not a function" si el contexto tarda en inicializar
    const login = typeof auth?.login === "function" ? auth.login : null;

    const [form, setForm] = useState({
        username: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Si la función login no está lista, abortamos para evitar errores
        if (!login) {
            setError("Error interno: El sistema de autenticación no está listo.");
            return;
        }

        setError("");
        setLoading(true);

        try {
            // Petición a la API de Vercel (carpeta /api/admin/login.js)
            const data = await api("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: form.username,
                    password: form.password,
                }),
            });

            if (data.success) {
                // 1. Guardamos los datos en el Contexto Global
                login(data.admin);

                // 2. Redirigimos al Dashboard
                navigate("/admin/dashboard");
            } else {
                // Mensaje devuelto por el backend (ej: "Usuario no encontrado")
                setError(data.message || "Credenciales incorrectas");
            }
        } catch (err) {
            console.error("Error en login:", err);
            setError("Error de conexión con el servidor.");
        } finally {
            setLoading(false);
        }
    };

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

                {/* Mensaje de Error */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-center text-sm font-medium">
                        {error}
                    </div>
                )}

                {/* Input Email */}
                <div className="mb-6">
                    <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-red-500 transition-all">
                        <span className="p-3 text-gray-400">
                            <FaSignInAlt />
                        </span>
                        <input
                            type="email"
                            placeholder="Correo electrónico"
                            className="w-full p-3 outline-none rounded-r-lg"
                            value={form.username}
                            onChange={(e) => handleChange("username", e.target.value)}
                            required
                        />
                    </div>
                </div>

                {/* Input Password */}
                <div className="mb-8">
                    <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-red-500 transition-all">
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

                {/* Botón de Acción */}
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full p-4 rounded-lg font-bold text-lg transition-all duration-200
                        ${loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-red-600 hover:bg-red-700 text-white shadow-lg active:transform active:scale-95"
                        }`}
                >
                    {loading ? "Verificando..." : "Entrar al Panel"}
                </button>
            </form>
        </div>
    );
}

export default LoginPage;