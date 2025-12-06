import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../../DB/supabaseClient";
import imageCompression from "browser-image-compression";

//  Define el nombre del bucket para consistencia
const BUCKET_NAME = "noticias"; 
const CATEGORIES = ["Policiacas", "Deportes", "SurSureste"];

function EditNewsPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        category: "",
        content: "",
        image_url: "", 
        image_path: "", 
    });

    const [newImage, setNewImage] = useState(null);
    const [removeImage, setRemoveImage] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        async function load() {
            setLoading(true);
            const { data, error } = await supabase
                .from("noticias")
                .select("*")
                .eq("id", id)
                .single();

            if (error || !data) {
                setError("Error cargando la noticia. Podría no existir.");
                return setLoading(false);
            }

            setFormData({
                title: data.title,
                category: data.category || CATEGORIES[0], // Aseguramos un valor por defecto si es nulo
                content: data.content,
                image_url: data.image_url || "", 
                image_path: data.image_path || "", 
            });

            // Establece la imagen actual como previsualización inicial
            if (data.image_url) {
                setImagePreview(data.image_url);
            }

            setLoading(false);
        }

        load();
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewImage(file);
            setRemoveImage(false);
            setSuccess("📸 Nueva imagen lista. Se subirá y optimizará al guardar.");
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveImage = () => {
        if (window.confirm("¿Estás seguro de ELIMINAR la imagen actual? Este cambio será permanente al guardar.")) {
            setRemoveImage(true);
            setNewImage(null);
            setImagePreview(null);
            setSuccess("⚠ Imagen marcada para eliminación al guardar.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");

        let updatedImageURL = formData.image_url;
        let updatedImagePath = formData.image_path;

        try {
            // 1. Borrar imagen previa (si se sube una nueva o se pide eliminar)
            if ((removeImage || newImage) && formData.image_path) {
                const { error: delErr } = await supabase.storage
                    .from(BUCKET_NAME) 
                    .remove([formData.image_path]);

                if (delErr) {
                    // Solo advertimos, no detenemos el proceso (la noticia puede seguir editándose)
                    console.warn("⚠ No se pudo borrar la imagen previa:", delErr);
                }

                updatedImageURL = null; 
                updatedImagePath = null; 
            }

            // 2. Subir nueva imagen
            if (newImage) {
                let finalFile = newImage;

                // Compresión si el archivo es grande
                if (newImage.size > 1024 * 1024) {
                    finalFile = await imageCompression(newImage, {
                        maxSizeMB: 1,
                        maxWidthOrHeight: 1600,
                        useWebWorker: true,
                    });
                }

                const fileName = `${Date.now()}_${finalFile.name.replace(/\s/g, "_")}`;
                const filePath = `noticias/${fileName}`; 

                const { error: uploadError } = await supabase.storage
                    .from(BUCKET_NAME) 
                    .upload(filePath, finalFile, {
                        cacheControl: "3600",
                        upsert: false,
                    });

                if (uploadError) {
                    console.error("Error de subida:", uploadError);
                    throw new Error("Error subiendo la imagen. Revisa la RLS en Supabase Storage."); 
                }

                const { data: publicURL } = supabase.storage
                    .from(BUCKET_NAME) 
                    .getPublicUrl(filePath);

                updatedImageURL = publicURL.publicUrl;
                updatedImagePath = filePath;
            }

            // 3. Actualizar registro en la tabla 'noticias'
            const { error: updateErr } = await supabase
                .from("noticias")
                .update({
                    title: formData.title,
                    category: formData.category,
                    content: formData.content,
                    image_url: updatedImageURL, 
                    image_path: updatedImagePath, 
                    updated_at: new Date().toISOString(), 
                })
                .eq("id", id);

            if (updateErr) throw updateErr;

            navigate("/admin/dashboard", {
                state: { message: `Noticia "${formData.title}" actualizada correctamente ✔` }
            });

        } catch (err) {
            console.error(err);
            setError(`❌ Error guardando cambios: ${err.message || "Error desconocido"}`);
        }

        setSaving(false);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mr-3"></div>
                <p className="text-lg text-gray-700 font-medium">Cargando noticia ID: {id}...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-10">
            <div className="max-w-5xl mx-auto bg-white p-6 sm:p-10 rounded-xl shadow-2xl">
                
                {/* Encabezado */}
                <div className="mb-8 border-b pb-4 flex justify-between items-center">
                    <h1 className="text-4xl font-extrabold text-gray-900">
                        Editando: {formData.title}
                    </h1>
                    <Link 
                        to="/admin/dashboard" 
                        className="text-sm font-medium text-gray-600 hover:text-blue-600 transition"
                    >
                        ← Volver al Dashboard
                    </Link>
                </div>

                {/* Mensajes de Alerta */}
                {error && <div className="p-4 rounded-lg mb-6 text-red-700 bg-red-100 border border-red-200 font-medium">{error}</div>}
                {success && <div className="p-4 rounded-lg mb-6 text-green-700 bg-green-100 border border-green-200 font-medium">{success}</div>}

                {/* FORMULARIO */}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* COLUMNA PRINCIPAL (CAMPOS) - 2/3 de Ancho */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Título */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Título</label>
                            <input
                                type="text"
                                name="title"
                                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Categoría */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Categoría</label>
                            <select
                                name="category"
                                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white transition"
                                value={formData.category}
                                onChange={handleChange}
                                required
                            >
                                {CATEGORIES.map(cat => (
                                    <option key={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Contenido */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Contenido</label>
                            <textarea
                                name="content"
                                rows="15"
                                className="w-full border border-gray-300 p-4 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
                                value={formData.content}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* COLUMNA LATERAL (IMAGEN Y ACCIÓN) - 1/3 de Ancho */}
                    <div className="lg:col-span-1 space-y-6">
                        
                        {/* IMAGEN DESTACADA */}
                        <div className="p-5 border border-gray-200 rounded-lg bg-white shadow-md">
                            <h3 className="text-md font-bold text-gray-800 mb-4 border-b pb-2">Imagen Destacada</h3>
                            
                            {/* Visualización de la Imagen */}
                            {(formData.image_url || imagePreview) && !removeImage ? (
                                <div className="mb-4">
                                    <img
                                        src={imagePreview || formData.image_url}
                                        alt="Imagen actual de la noticia"
                                        className="w-full h-32 object-cover rounded shadow-lg border border-gray-100"
                                    />
                                    <p className="p-1 text-xs text-center text-gray-600 bg-gray-50 border-x border-b rounded-b">
                                        {newImage ? "NUEVA IMAGEN cargada (se subirá al guardar)." : "Imagen actual en DB."}
                                    </p>
                                    
                                    {/* Botón de Remover Imagen */}
                                    {formData.image_path && !newImage && (
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="block mt-3 w-full py-1 text-sm font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition"
                                            title="La imagen se eliminará de Supabase Storage al guardar"
                                        >
                                            ❌ Eliminar imagen actual
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 p-3 border rounded text-center mb-3">
                                    {removeImage ? "Imagen marcada para eliminación." : "No hay imagen actual."}
                                </p>
                            )}

                            {/* Campo de Subida de Imagen */}
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Subir nueva imagen:
                            </label>
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleImageChange} 
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />

                            <p className="text-xs text-gray-500 mt-2">La imagen se optimizará (max 1MB/1600px) al guardar.</p>
                        </div>

                        {/* BOTÓN DE GUARDAR */}
                        <button
                            type="submit"
                            disabled={saving}
                            className={`w-full py-4 text-lg font-extrabold rounded-lg shadow-xl transition duration-300 transform 
                                ${saving 
                                    ? "bg-gray-400 text-gray-700 cursor-not-allowed" 
                                    : "bg-green-600 text-white hover:bg-green-700 hover:scale-[1.01] active:scale-100"
                                }
                            `}
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