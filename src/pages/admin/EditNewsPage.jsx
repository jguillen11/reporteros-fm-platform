import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import imageCompression from "browser-image-compression";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext"; // 1. Importar Auth

const CATEGORIES = [
    "Informacion", "Municipios", "Estados", "Policiacas",
    "Espectaculos", "Deportes", "Finanzas", "SurSureste",
    "Nacionales", "Cultura",
];

function EditNewsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isLoggedIn, loading: authLoading } = useAuth(); // 2. Obtener estado auth

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        category: CATEGORIES[0],
        content: "",
        image_url: "",
    });

    const [newImage, setNewImage] = useState(null);
    const [removeImage, setRemoveImage] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

    // 🔐 3. Protección de ruta
    useEffect(() => {
        if (!authLoading && !isLoggedIn) {
            navigate("/admin/login", { replace: true });
        }
    }, [isLoggedIn, authLoading, navigate]);

    // 🔄 4. Cargar noticia (Actualizado para usar api.js correctamente)
    useEffect(() => {
        async function load() {
            if (!isLoggedIn) return; // No cargar si no hay sesión

            setLoading(true);
            setError("");

            try {
                // El servicio api ya maneja el res.ok y res.json()
                const data = await api(`/api/noticias/${id}`);

                setFormData({
                    title: data.title || "",
                    category: data.category || CATEGORIES[0],
                    content: data.content || "",
                    image_url: data.image_url || "",
                });

                if (data.image_url) {
                    setImagePreview(data.image_url);
                }
            } catch (err) {
                console.error(err);
                setError("La noticia no existe o hubo un error de conexión.");
            } finally {
                setLoading(false);
            }
        }

        if (!authLoading) load();
    }, [id, isLoggedIn, authLoading]);

    // 🧠 Handlers
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        let finalFile = file;
        if (file.size > 1024 * 1024) {
            setSuccess("Optimizando imagen...");
            finalFile = await imageCompression(file, {
                maxSizeMB: 1,
                maxWidthOrHeight: 1600,
                useWebWorker: true,
            });
        }

        setNewImage(finalFile);
        setRemoveImage(false);
        if (imagePreview && imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
        setImagePreview(URL.createObjectURL(finalFile));
        setSuccess("📸 Nueva imagen lista.");
    };

    const handleRemoveImage = () => {
        if (window.confirm("¿Eliminar la imagen actual?")) {
            setRemoveImage(true);
            setNewImage(null);
            setImagePreview(null);
            setSuccess("⚠ Imagen marcada para eliminación.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");

        try {
            let finalImageUrl = formData.image_url;

            // 1. SI HAY UNA IMAGEN NUEVA, SUBIRLA A CLOUDINARY
            if (newImage) {
                setSuccess("Subiendo nueva imagen...");
                const cloudData = new FormData();
                cloudData.append("file", newImage);
                cloudData.append("upload_preset", "reporterosenfm"); // Tu preset de la imagen anterior

                const cloudRes = await fetch(
                    "https://api.cloudinary.com/v1_1/TU_CLOUD_NAME/image/upload", // Pon tu Cloud Name real aquí
                    { method: "POST", body: cloudData }
                );

                if (!cloudRes.ok) throw new Error("Error al subir la nueva imagen");

                const cloudJson = await cloudRes.json();
                finalImageUrl = cloudJson.secure_url;
            }
            // 2. SI EL USUARIO MARCÓ ELIMINAR IMAGEN
            else if (removeImage) {
                finalImageUrl = null;
            }

            // 3. ENVIAR TODO COMO JSON AL SERVIDOR
            await api(`/api/noticias/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: formData.title,
                    category: formData.category,
                    content: formData.content,
                    image_url: finalImageUrl
                }),
            });

            navigate("/admin/dashboard", {
                state: { message: `"${formData.title}" actualizada correctamente ✔` },
            });
        } catch (err) {
            console.error(err);
            setError("❌ Error al guardar los cambios: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    // Renderizado condicional para carga de Auth o Datos
    if (authLoading || (loading && !error)) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mr-3"></div>
                <p>Cargando información...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-10">
            <div className="max-w-5xl mx-auto bg-white p-6 sm:p-10 rounded-xl shadow-2xl">
                <div className="mb-8 border-b pb-4 flex justify-between items-center">
                    <h1 className="text-xl sm:text-3xl font-extrabold text-gray-900 truncate mr-4">
                        Editando: {formData.title}
                    </h1>
                    <Link to="/admin/dashboard" className="text-sm font-medium text-blue-600 hover:underline shrink-0">
                        ← Volver
                    </Link>
                </div>

                {error && <div className="p-4 mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>}
                {success && <div className="p-4 mb-6 bg-green-50 border border-green-200 text-green-700 rounded-lg">{success}</div>}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Título</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Categoría</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full border p-3 rounded-lg bg-white outline-none"
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
                                rows="15"
                                value={formData.content}
                                onChange={handleChange}
                                className="w-full border p-4 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="p-5 bg-gray-50 border rounded-lg shadow-inner">
                            <h3 className="font-bold text-gray-800 mb-4">Imagen del Artículo</h3>
                            {imagePreview && !removeImage ? (
                                <div className="relative group">
                                    <img
                                        src={imagePreview}
                                        className="w-full h-48 object-cover rounded-lg border shadow-sm"
                                        alt="Preview"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="mt-3 w-full bg-white text-red-600 border border-red-200 py-2 rounded hover:bg-red-50 transition"
                                    >
                                        🗑 Eliminar imagen
                                    </button>
                                </div>
                            ) : (
                                <div className="h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
                                    Sin imagen seleccionada
                                </div>
                            )}

                            <div className="mt-4">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Subir nueva</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="w-full text-sm"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className={`w-full py-4 font-bold rounded-lg text-white shadow-lg transition-all ${saving ? "bg-gray-400" : "bg-green-600 hover:bg-green-700 active:scale-95"
                                }`}
                        >
                            {saving ? "Guardando..." : "Guardar Cambios"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditNewsPage;