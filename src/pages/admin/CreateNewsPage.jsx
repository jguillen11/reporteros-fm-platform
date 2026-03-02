import React, { useState, useEffect } from "react"; // Añadimos useEffect
import { useNavigate, Link } from "react-router-dom";
import imageCompression from "browser-image-compression";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext"; // Importamos el hook de auth

const CATEGORIES = [
    "Informacion", "Municipios", "Estados", "Policiacas",
    "Espectaculos", "Deportes", "Finanzas", "SurSureste",
    "Nacionales", "Cultura",
];

export default function CreateNewsPage() {
    const navigate = useNavigate();
    const { isLoggedIn, loading: authLoading } = useAuth(); // Obtenemos el estado de auth

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        category: CATEGORIES[0],
        content: "",
        imageFile: null,
    });
    const [imagePreview, setImagePreview] = useState(null);

    // 🔐 1. Protección de ruta: Si no está logueado, redirigir al login
    useEffect(() => {
        if (!authLoading && !isLoggedIn) {
            navigate("/admin/login", { replace: true });
        }
    }, [isLoggedIn, authLoading, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setMessage("");
        setMessageType("");

        let finalFile = file;

        // Optimización si pesa más de 1MB
        if (file.size > 1024 * 1024) {
            setMessage("Optimizando imagen...");
            setMessageType("success");
            try {
                finalFile = await imageCompression(file, {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1600,
                    useWebWorker: true,
                });
            } catch (error) {
                console.error("Error comprimiendo:", error);
            }
        }

        setFormData({ ...formData, imageFile: finalFile });

        // Limpiar preview anterior para evitar fugas de memoria
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setImagePreview(URL.createObjectURL(finalFile));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.content.trim()) {
            setMessage("El título y el contenido son obligatorios.");
            setMessageType("error");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const body = new FormData();
            body.append("title", formData.title);
            body.append("category", formData.category);
            body.append("content", formData.content);

            if (formData.imageFile) {
                body.append("image", formData.imageFile);
            }

            // Enviamos a la API
            await api("/api/noticias", {
                method: "POST",
                body,
                // Nota: No pongas 'Content-Type', el navegador lo pone 
                // automáticamente con el boundary correcto para FormData
            });

            // Si llegamos aquí, la API respondió success (api.js maneja errores 400/500)
            navigate("/admin/dashboard", {
                state: {
                    message: `Noticia "${formData.title}" publicada correctamente ✔`,
                },
            });
        } catch (err) {
            console.error(err);
            setMessage("❌ Error al publicar la noticia. Inténtalo de nuevo.");
            setMessageType("error");
        } finally {
            setLoading(false);
        }
    };

    // Si el sistema de auth está verificando la sesión, mostramos loader
    if (authLoading) return <div className="p-10 text-center">Verificando sesión...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-10">
            <div className="max-w-5xl mx-auto bg-white p-6 sm:p-10 rounded-xl shadow-2xl">

                {/* Encabezado */}
                <div className="mb-8 border-b pb-4 flex justify-between items-center">
                    <h1 className="text-3xl font-extrabold text-gray-900">
                        Publicar Artículo
                    </h1>
                    <Link
                        to="/admin/dashboard"
                        className="text-sm font-medium text-blue-600 hover:underline"
                    >
                        ← Volver al Panel
                    </Link>
                </div>

                {/* Mensajes de estado */}
                {message && (
                    <div className={`p-4 rounded-lg mb-6 border ${messageType === "error" ? "bg-red-50 border-red-200 text-red-700" : "bg-blue-50 border-blue-200 text-blue-700"
                        }`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Campos de texto */}
                    <div className="lg:col-span-2 space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Título</label>
                            <input
                                type="text"
                                name="title"
                                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Categoría</label>
                            <select
                                name="category"
                                className="w-full border border-gray-300 p-3 rounded-lg bg-white outline-none"
                                value={formData.category}
                                onChange={handleChange}
                            >
                                {CATEGORIES.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Contenido</label>
                            <textarea
                                name="content"
                                rows="12"
                                className="w-full border border-gray-300 p-4 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none resize-none"
                                value={formData.content}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Sidebar de imagen y envío */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="p-5 bg-gray-50 border border-gray-200 rounded-lg">
                            <h3 className="font-bold text-gray-800 mb-4">Imagen Destacada</h3>

                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="text-sm text-gray-600 mb-4 w-full"
                            />

                            {imagePreview && (
                                <div className="rounded-lg overflow-hidden border bg-white">
                                    <img
                                        src={imagePreview}
                                        className="w-full h-48 object-cover"
                                        alt="Preview"
                                    />
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 text-white text-lg font-bold rounded-lg shadow-lg transition-all ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-sky-700 hover:bg-sky-800 active:scale-95"
                                }`}
                        >
                            {loading ? "Publicando..." : "Publicar Noticia"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}