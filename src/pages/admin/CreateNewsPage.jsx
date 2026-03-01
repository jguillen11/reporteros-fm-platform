import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import imageCompression from "browser-image-compression";
import { api } from "../../services/api";

const CATEGORIES = [
    "Informacion",
    "Municipios",
    "Estados",
    "Policiacas",
    "Espectaculos",
    "Deportes",
    "Finanzas",
    "SurSureste",
    "Nacionales",
    "Cultura",
];

export default function CreateNewsPage() {
    const navigate = useNavigate();

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        category: CATEGORIES[0],
        content: "",
        imageFile: null,
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);

    // ---------------------------------------
    // ⚙️ Manejadores
    // ---------------------------------------
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setMessage("");
        setMessageType("");

        let finalFile = file;

        if (file.size > 1024 * 1024) {
            setMessage("La imagen se optimizará antes de subirse.");
            setMessageType("success");

            finalFile = await imageCompression(file, {
                maxSizeMB: 1,
                maxWidthOrHeight: 1600,
                useWebWorker: true,
            });
        }

        setFormData({ ...formData, imageFile: finalFile });
        setImagePreview(URL.createObjectURL(finalFile));
    };

    // ---------------------------------------
    // 💾 Guardar Noticia (NEON)
    // ---------------------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.content) {
            setMessage("El título y el contenido son obligatorios.");
            setMessageType("error");
            return;
        }

        setLoading(true);
        setMessage("");
        setMessageType("");

        try {
            const body = new FormData();
            body.append("title", formData.title);
            body.append("category", formData.category);
            body.append("content", formData.content);

            if (formData.imageFile) {
                body.append("image", formData.imageFile);
            }

            const res = await api("/api/noticias", {
                method: "POST",
                body,
            });

            if (!res.ok) {
                throw new Error("Error al crear noticia");
            }

            navigate("/admin/dashboard", {
                state: {
                    message: `Noticia "${formData.title}" publicada correctamente ✔`,
                },
            });
        } catch (err) {
            console.error(err);
            setMessage("❌ Error al publicar la noticia.");
            setMessageType("error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-10">
            <div className="max-w-5xl mx-auto bg-white p-6 sm:p-10 rounded-xl shadow-2xl">

                {/* Encabezado */}
                <div className="mb-8 border-b pb-4 flex justify-between items-center">
                    <h1 className="text-4xl font-extrabold text-gray-900">
                        Publicar Nuevo Artículo
                    </h1>
                    <Link
                        to="/admin/dashboard"
                        className="text-sm font-medium text-gray-600 hover:text-blue-600 transition"
                    >
                        ← Volver al Panel
                    </Link>
                </div>

                {/* Mensajes */}
                {message && (
                    <div
                        className={`p-4 rounded-lg mb-6 text-sm font-medium ${
                            messageType === "error"
                                ? "bg-red-100 text-red-700 border border-red-200"
                                : "bg-green-100 text-green-700 border border-green-200"
                        }`}
                    >
                        {message}
                    </div>
                )}

                {/* FORMULARIO */}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* COLUMNA PRINCIPAL */}
                    <div className="lg:col-span-2 space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Título
                            </label>
                            <input
                                type="text"
                                name="title"
                                className="w-full border border-gray-300 p-3 rounded-lg"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Categoría
                            </label>
                            <select
                                name="category"
                                className="w-full border border-gray-300 p-3 rounded-lg bg-white"
                                value={formData.category}
                                onChange={handleChange}
                            >
                                {CATEGORIES.map((c) => (
                                    <option key={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Contenido
                            </label>
                            <textarea
                                name="content"
                                rows="15"
                                className="w-full border border-gray-300 p-4 rounded-lg"
                                value={formData.content}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* COLUMNA LATERAL */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="p-5 border border-gray-200 rounded-lg shadow-md">
                            <h3 className="text-md font-bold text-gray-800 mb-3 border-b pb-2">
                                Imagen Destacada
                            </h3>

                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-500"
                            />

                            {imagePreview && (
                                <div className="mt-4 border rounded-lg overflow-hidden">
                                    <img
                                        src={imagePreview}
                                        className="w-full h-40 object-cover"
                                        alt="Preview"
                                    />
                                    <p className="p-2 text-xs text-center text-gray-600 bg-gray-50">
                                        Vista previa (optimizada)
                                    </p>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 text-lg font-extrabold rounded-lg shadow-xl transition
                                ${
                                    loading
                                        ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                                        : "bg-sky-700 text-white hover:bg-sky-800"
                                }`}
                        >
                            {loading ? "Guardando..." : "Guardar y Publicar Noticia"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}