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
        if (loading) return; // Evita múltiples clics

        setError("");
        setLoading(true);
        console.log("Intentando login con:", form.username);

        try {
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

            console.log("Datos recibidos del servidor:", data);

            // Cambiamos la condición para ser más flexibles:
            // Si el backend devuelve success:true O si simplemente viene el objeto admin
            if (data.success || data.admin) {
                console.log("Login validado. Guardando sesión...");

                // Guardamos algo que no sea undefined
                const adminId = data.admin?.id || "admin-session";
                localStorage.setItem("admin_token", adminId);

                // Forzamos la redirección
                navigate("/admin/dashboard");
            } else {
                setError(data.message || "Credenciales incorrectas");
            }

        } catch (err) {
            console.error("Error detallado en catch:", err);
            setError("Error de conexión o credenciales inválidas.");
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