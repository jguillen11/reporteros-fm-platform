import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaUserShield, FaSignInAlt, FaLock } from 'react-icons/fa';
import { supabase } from "../../DB/supabaseClient";

function LoginPage() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ username: "", password: "" });
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const { error } = await supabase.auth.signInWithPassword({
            email: form.username,
            password: form.password
        });

        if (error) {
            setError("Correo o contraseña incorrectos.");
        } else {
            navigate("/admin/dashboard");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <form
                onSubmit={handleSubmit}
                className="bg-white w-full max-w-sm p-10 rounded-2xl shadow-xl"
            >
                <div className="flex flex-col items-center mb-8">
                    <FaUserShield className="text-4xl text-red-600 mb-3" />
                    <h2 className="text-3xl text-center font-extrabold text-gray-800">
                        Acceso Administrativo
                    </h2>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-center">
                        {error}
                    </div>
                )}

                <div className="mb-6">
                    <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-red-500">
                        <span className="p-3 text-gray-400"><FaSignInAlt /></span>
                        <input
                            type="email"
                            placeholder="Correo"
                            className="w-full p-3 outline-none rounded-r-lg"
                            value={form.username}
                            onChange={(e) => setForm({ ...form, username: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <div className="mb-8">
                    <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-red-500">
                        <span className="p-3 text-gray-400"><FaLock /></span>
                        <input
                            type="password"
                            placeholder="Contraseña"
                            className="w-full p-3 outline-none rounded-r-lg"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-red-600 text-white p-4 rounded-lg font-bold text-lg hover:bg-red-700"
                >
                    Entrar
                </button>
            </form>
        </div>
    );
}

export default LoginPage;
