import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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

function EditNewsPage() {
    const { id } = useParams();
    const navigate = useNavigate();

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

    // ---------------------------------------
    // 🔄 Cargar noticia (NEON)
    // ---------------------------------------
    useEffect(() => {
        async function load() {
            setLoading(true);
            setError("");

            try {
                const res = await api(`/api/noticias/${id}`);

                if (!res.ok) {
                    throw new Error("No encontrada");
                }

                const data = await res.json();

                setFormData({
                    title: data.title,
                    category: data.category || CATEGORIES[0],
                    content: data.content,
                    image_url: data.image_url || "",
                });

                if (data.image_url) {
                    setImagePreview(data.image_url);
                }
            } catch (err) {
                console.error(err);
                setError("Error cargando la noticia. Podría no existir.");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [id]);

    // ---------------------------------------
    // 🧠 Handlers
    // ---------------------------------------
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        let finalFile = file;

        if (file.size > 1024 * 1024) {
            finalFile = await imageCompression(file, {
                maxSizeMB: 1,
                maxWidthOrHeight: 1600,
                useWebWorker: true,
            });
        }

        setNewImage(finalFile);
        setRemoveImage(false);
        setImagePreview(URL.createObjectURL(finalFile));
        setSuccess("📸 Nueva imagen lista. Se subirá al guardar.");
    };

    const handleRemoveImage = () => {
        if (window.confirm("¿Eliminar la imagen actual?")) {
            setRemoveImage(true);
            setNewImage(null);
            setImagePreview(null);
            setSuccess("⚠ Imagen marcada para eliminación.");
        }
    };

    // ---------------------------------------
    // 💾 Guardar cambios (PUT NEON)
    // ---------------------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const body = new FormData();
            body.append("title", formData.title);
            body.append("category", formData.category);
            body.append("content", formData.content);

            if (newImage) body.append("image", newImage);
            if (removeImage) body.append("removeImage", "true");

            const res = await api(`/api/noticias/${id}`, {
                method: "PUT",
                body,
            });

            if (!res.ok) {
                throw new Error("Error actualizando");
            }

            navigate("/admin/dashboard", {
                state: {
                    message: `Noticia "${formData.title}" actualizada correctamente ✔`,
                },
            });
        } catch (err) {
            console.error(err);
            setError("❌ Error guardando cambios.");
        } finally {
            setSaving(false);
        }
    };

    // ---------------------------------------
    // ⏳ Loading
    // ---------------------------------------
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mr-3"></div>
                <p className="text-lg text-gray-700 font-medium">
                    Cargando noticia ID: {id}...
                </p>
            </div>
        );
    }

    // ---------------------------------------
    // 🖼 UI (sin cambios)
    // ---------------------------------------
    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-10">
            <div className="max-w-5xl mx-auto bg-white p-6 sm:p-10 rounded-xl shadow-2xl">

                <div className="mb-8 border-b pb-4 flex justify-between items-center">
                    <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900">
                        Editando: {formData.title}
                    </h1>
                    <Link
                        to="/admin/dashboard"
                        className="text-sm font-medium text-gray-600 hover:text-blue-600 transition"
                    >
                        ← Volver
                    </Link>
                </div>

                {error && (
                    <div className="p-4 mb-6 bg-red-100 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="p-4 mb-6 bg-green-100 text-green-700 rounded">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    <div className="lg:col-span-2 space-y-6">
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full border p-3 rounded-lg"
                            required
                        />

                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full border p-3 rounded-lg"
                        >
                            {CATEGORIES.map((c) => (
                                <option key={c}>{c}</option>
                            ))}
                        </select>

                        <textarea
                            name="content"
                            rows="15"
                            value={formData.content}
                            onChange={handleChange}
                            className="w-full border p-4 rounded-lg"
                            required
                        />
                    </div>

                    <div className="space-y-6">
                        <div className="p-4 border rounded-lg">
                            {imagePreview && !removeImage ? (
                                <>
                                    <img
                                        src={imagePreview}
                                        className="w-full h-32 object-cover rounded"
                                        alt="Preview"
                                    />
                                    {!newImage && (
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="mt-3 w-full text-red-600"
                                        >
                                            ❌ Eliminar imagen
                                        </button>
                                    )}
                                </>
                            ) : (
                                <p className="text-sm text-gray-500 text-center">
                                    Sin imagen
                                </p>
                            )}

                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="mt-3"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className={`w-full py-4 font-bold rounded-lg ${
                                saving
                                    ? "bg-gray-400"
                                    : "bg-green-600 hover:bg-green-700 text-white"
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