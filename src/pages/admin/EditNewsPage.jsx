import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import imageCompression from "browser-image-compression";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const CATEGORIES = [
    "Informacion", "Municipios", "Estados", "Policiacas",
    "Espectaculos", "Deportes", "Finanzas", "SurSureste",
    "Nacionales", "Cultura", "Tonila",
];

const MAX_IMAGES = 5;

function EditNewsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isLoggedIn, loading: authLoading } = useAuth();

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

    // Imágenes existentes (URLs de Cloudinary ya guardadas)
    const [existingImages, setExistingImages] = useState([]); // ["url1", "url2", ...]

    // Nuevas imágenes a subir { file, preview }
    const [newImages, setNewImages] = useState([]);

    useEffect(() => {
        if (!authLoading && !isLoggedIn) {
            navigate("/admin/login", { replace: true });
        }
    }, [isLoggedIn, authLoading, navigate]);

    useEffect(() => {
        return () => newImages.forEach(img => URL.revokeObjectURL(img.preview));
    }, [newImages]);

    useEffect(() => {
        async function load() {
            if (!isLoggedIn) return;
            setLoading(true);
            setError("");
            try {
                const data = await api(`/noticias/${id}`);
                setFormData({
                    title: data.title || "",
                    category: data.category || CATEGORIES[0],
                    content: data.content || "",
                    image_url: data.image_url || "",
                });
                // Cargar imágenes existentes: portada + galería
                const allImages = [];
                if (data.image_url) allImages.push(data.image_url);
                if (Array.isArray(data.images)) allImages.push(...data.images);
                setExistingImages(allImages);
            } catch (err) {
                console.error(err);
                setError("La noticia no existe o hubo un error de conexión.");
            } finally {
                setLoading(false);
            }
        }
        if (!authLoading) load();
    }, [id, isLoggedIn, authLoading]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const totalImages = existingImages.length + newImages.length;

    const handleFilesChange = async (e) => {
        const selected = Array.from(e.target.files);
        const remaining = MAX_IMAGES - totalImages;

        if (remaining <= 0) {
            setError(`Máximo ${MAX_IMAGES} imágenes por noticia.`);
            return;
        }

        const toProcess = selected.slice(0, remaining);
        setSuccess("Procesando imágenes...");

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

        setNewImages(prev => [...prev, ...processed]);
        setSuccess("");
        e.target.value = "";
    };

    const removeExistingImage = (index) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeNewImage = (index) => {
        setNewImages(prev => {
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
        setSaving(true);
        setError("");
        setSuccess("");

        try {
            // Subir nuevas imágenes a Cloudinary
            let uploadedUrls = [];
            if (newImages.length > 0) {
                setSuccess("Subiendo imágenes nuevas...");
                uploadedUrls = await Promise.all(
                    newImages.map(img => uploadToCloudinary(img.file))
                );
            }

            // Combinar existentes + nuevas
            const allUrls = [...existingImages, ...uploadedUrls];
            const image_url = allUrls[0] || null;   // Portada = primera
            const images = allUrls.slice(1);         // Resto = galería

            setSuccess("Guardando cambios...");

            await api(`/noticias/${id}`, {
                method: "PUT",
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
                state: { message: `"${formData.title}" actualizada correctamente ✔` },
            });
        } catch (err) {
            console.error(err);
            setError("❌ Error: " + err.message);
        } finally {
            setSaving(false);
        }
    };

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

                {error && <div className="p-4 mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg font-medium">{error}</div>}
                {success && <div className="p-4 mb-6 bg-green-50 border border-green-200 text-green-700 rounded-lg font-medium">{success}</div>}

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

                    {/* Sidebar imágenes */}
                    <div className="space-y-6">
                        <div className="p-5 bg-gray-50 border rounded-lg shadow-inner">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-800">Imágenes</h3>
                                <span className="text-xs text-gray-500">{totalImages}/{MAX_IMAGES}</span>
                            </div>

                            {/* Grid de imágenes existentes + nuevas */}
                            {totalImages > 0 && (
                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    {existingImages.map((url, i) => (
                                        <div key={`ex-${i}`} className="relative group rounded-lg overflow-hidden border bg-white">
                                            {i === 0 && (
                                                <span className="absolute top-1 left-1 z-10 text-[10px] font-bold bg-sky-600 text-white px-1.5 py-0.5 rounded">
                                                    Portada
                                                </span>
                                            )}
                                            <img src={url} alt={`img-${i}`} className="w-full h-24 object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeExistingImage(i)}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                    {newImages.map((img, i) => (
                                        <div key={`new-${i}`} className="relative group rounded-lg overflow-hidden border border-dashed border-sky-400 bg-white">
                                            <span className="absolute top-1 left-1 z-10 text-[10px] font-bold bg-green-500 text-white px-1.5 py-0.5 rounded">
                                                Nueva
                                            </span>
                                            <img src={img.preview} alt={`new-${i}`} className="w-full h-24 object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeNewImage(i)}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Botón agregar más */}
                            {totalImages < MAX_IMAGES && (
                                <label className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-sky-400 hover:bg-sky-50 transition text-sm text-gray-500 hover:text-sky-600">
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
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className={`w-full py-4 font-bold rounded-lg text-white shadow-lg transition-all ${
                                saving ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 active:scale-95"
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