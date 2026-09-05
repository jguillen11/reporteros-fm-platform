import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import imageCompression from "browser-image-compression";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const CATEGORIES = [
    "Informacion", "Municipios", "Estados", "Policiacas",
    "Espectaculos", "Deportes", "Finanzas", "SurSureste",
    "Nacionales", "Cultura", "Tonila",
];

const MAX_IMAGES = 5;

export default function CreateNewsPage() {
    const navigate = useNavigate();
    const { isLoggedIn, loading: authLoading } = useAuth();

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        category: CATEGORIES[0],
        content: "",
    });

    // Lista de { file, preview } para las imágenes
    const [imageFiles, setImageFiles] = useState([]);

    useEffect(() => {
        if (!authLoading && !isLoggedIn) {
            navigate("/admin/login", { replace: true });
        }
    }, [isLoggedIn, authLoading, navigate]);

    // Limpiar URLs de objeto al desmontar
    useEffect(() => {
        return () => imageFiles.forEach(img => URL.revokeObjectURL(img.preview));
    }, [imageFiles]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFilesChange = async (e) => {
        const selected = Array.from(e.target.files);
        const remaining = MAX_IMAGES - imageFiles.length;

        if (remaining <= 0) {
            setMessage(`Máximo ${MAX_IMAGES} imágenes por noticia.`);
            setMessageType("error");
            return;
        }

        const toProcess = selected.slice(0, remaining);
        setMessage("Procesando imágenes...");
        setMessageType("");

        const processed = await Promise.all(
            toProcess.map(async (file) => {
                let finalFile = file;
                if (file.size > 1024 * 1024) {
                    try {
                        finalFile = await imageCompression(file, {
                            maxSizeMB: 1,
                            maxWidthOrHeight: 1600,
                            useWebWorker: true,
                        });
                    } catch (err) {
                        console.error("Error comprimiendo:", err);
                    }
                }
                return { file: finalFile, preview: URL.createObjectURL(finalFile) };
            })
        );

        setImageFiles(prev => [...prev, ...processed]);
        setMessage("");
        e.target.value = "";
    };

    const removeImage = (index) => {
        setImageFiles(prev => {
            URL.revokeObjectURL(prev[index].preview);
            return prev.filter((_, i) => i !== index);
        });
    };

    const uploadToCloudinary = async (file) => {
        const cloudData = new FormData();
        cloudData.append("file", file);
        cloudData.append("upload_preset", "reporterosenfm");

        const res = await fetch(
            "https://api.cloudinary.com/v1_1/devyv3g2n/image/upload",
            { method: "POST", body: cloudData }
        );
        if (!res.ok) throw new Error("Error al subir imagen a Cloudinary");
        const json = await res.json();
        return json.secure_url;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.content.trim()) {
            setMessage("El título y el contenido son obligatorios.");
            setMessageType("error");
            return;
        }

        setLoading(true);
        setMessage("Subiendo imágenes...");

        try {
            // Subir todas las imágenes a Cloudinary en paralelo
            const urls = await Promise.all(
                imageFiles.map(img => uploadToCloudinary(img.file))
            );

            const image_url = urls[0] || "";       // Portada = primera imagen
            const images = urls.slice(1);           // Resto = galería

            setMessage("Guardando noticia...");

            await api("/noticias", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: formData.title,
                    category: formData.category,
                    content: formData.content,
                    image_url,
                    images,
                }),
            });

            navigate("/admin/dashboard", {
                state: { message: `Noticia "${formData.title}" publicada correctamente ✔` },
            });
        } catch (err) {
            console.error(err);
            setMessage("❌ Error: " + err.message);
            setMessageType("error");
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) return <div className="p-10 text-center">Verificando sesión...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-10">
            <div className="max-w-5xl mx-auto bg-white p-6 sm:p-10 rounded-xl shadow-2xl">

                <div className="mb-8 border-b pb-4 flex justify-between items-center">
                    <h1 className="text-3xl font-extrabold text-gray-900">Publicar Artículo</h1>
                    <Link to="/admin/dashboard" className="text-sm font-medium text-blue-600 hover:underline">
                        ← Volver al Panel
                    </Link>
                </div>

                {message && (
                    <div className={`p-4 rounded-lg mb-6 border ${messageType === "error"
                            ? "bg-red-50 border-red-200 text-red-700"
                            : "bg-blue-50 border-blue-200 text-blue-700"
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

                    {/* Sidebar imágenes */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="p-5 bg-gray-50 border border-gray-200 rounded-lg">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-bold text-gray-800">Imágenes</h3>
                                <span className="text-xs text-gray-500">
                                    {imageFiles.length}/{MAX_IMAGES}
                                </span>
                            </div>

                            {/* Botón para agregar imágenes */}
                            {imageFiles.length < MAX_IMAGES && (
                                <label className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-sky-400 hover:bg-sky-50 transition text-sm text-gray-500 hover:text-sky-600 mb-4">
                                    <span>+ Agregar imágenes</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleFilesChange}
                                        className="hidden"
                                    />
                                </label>
                            )}

                            {/* Grid de previews */}
                            {imageFiles.length > 0 && (
                                <div className="grid grid-cols-2 gap-2">
                                    {imageFiles.map((img, i) => (
                                        <div key={i} className="relative group rounded-lg overflow-hidden border bg-white">
                                            {i === 0 && (
                                                <span className="absolute top-1 left-1 z-10 text-[10px] font-bold bg-sky-600 text-white px-1.5 py-0.5 rounded">
                                                    Portada
                                                </span>
                                            )}
                                            <img
                                                src={img.preview}
                                                alt={`imagen-${i}`}
                                                className="w-full h-24 object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(i)}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {imageFiles.length === 0 && (
                                <p className="text-xs text-gray-400 text-center mt-2">
                                    La primera imagen será la portada
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 text-white text-lg font-bold rounded-lg shadow-lg transition-all ${loading
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-sky-700 hover:bg-sky-800 active:scale-95"
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