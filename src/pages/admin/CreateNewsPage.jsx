import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../../DB/supabaseClient";
import imageCompression from "browser-image-compression";

const CATEGORIES = ["Policiacas", "Deportes", "SurSureste"];
// 💡 Nombre del bucket que definiste anteriormente
const BUCKET_NAME = "noticias"; 

export default function CreateNewsPage() {
    const navigate = useNavigate();

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        category: CATEGORIES[0],
        content: "",
        imageFile: null
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);

    // ---------------------------------------
    // ⚙️ Manejadores de Estado
    // ---------------------------------------
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validar tamaño inicial (opcional)
        if (file.size > 5 * 1024 * 1024) {
             setMessage("El archivo es demasiado grande (máx 5MB recomendado). Se intentará comprimir.");
             setMessageType("error");
        } else {
             setMessage("Imagen lista para ser publicada. Se optimizará al guardar.");
             setMessageType("success");
        }

        setFormData({ ...formData, imageFile: file });
        setImagePreview(URL.createObjectURL(file));
    };

    // ---------------------------------------
    // 💾 Lógica de Subida y Publicación
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
            let image_url = null;
            let image_path = null;

            // 1. Lógica de Subida de Imagen
            if (formData.imageFile) {
                let finalFile = formData.imageFile;
                setMessage("Comprimiendo y subiendo imagen...");
                setMessageType("success");

                // Comprimir la imagen antes de subirla
                if (formData.imageFile.size > 1024 * 1024) {
                    finalFile = await imageCompression(formData.imageFile, {
                        maxSizeMB: 1, // Max 1 MB
                        maxWidthOrHeight: 1600,
                        useWebWorker: true,
                    });
                }
                
                const fileName = `${Date.now()}_${finalFile.name.replace(/\s/g, "_")}`;
                const filePath = `noticias/${fileName}`; 

                // Subir a Supabase Storage
                const { error: uploadError } = await supabase.storage
                    .from(BUCKET_NAME) 
                    .upload(filePath, finalFile, {
                        cacheControl: "3600",
                        upsert: false,
                    });

                if (uploadError) {
                    console.error(uploadError);
                    throw new Error("Error subiendo la imagen. Revisa la RLS en Supabase Storage."); 
                }

                // Obtener URL pública
                const { data: publicURL } = supabase.storage
                    .from(BUCKET_NAME) 
                    .getPublicUrl(filePath);

                image_url = publicURL.publicUrl;
                image_path = filePath;
            }


            // 2. GUARDAR NOTICIA EN SUPABASE
            const { error: insertError } = await supabase
                .from("noticias")
                .insert([
                    {
                        title: formData.title,
                        category: formData.category,
                        content: formData.content,
                        image_url,
                        image_path,
                    }
                ])
                .select('id'); 

            if (insertError) throw insertError;

            // 3. Redirección en éxito
            navigate("/admin/dashboard", {
                state: { message: `Noticia "${formData.title}" publicada correctamente ✔` }
            });

        } catch (err) {
            console.error("Error al publicar:", err);
            setMessage(`❌ Error al publicar la noticia: ${err.message || "Error desconocido"}`);
            setMessageType("error");
        }

        setLoading(false);
    };

    // ---------------------------------------
    // 🖼️ Renderizado
    // ---------------------------------------
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

                {/* Mensajes de Alerta */}
                {message && (
                    <div className={`p-4 rounded-lg mb-6 text-sm font-medium ${
                        messageType === "error" ? "bg-red-100 text-red-700 border border-red-200" : "bg-green-100 text-green-700 border border-green-200"
                    }`}>
                        {message}
                    </div>
                )}

                {/* FORMULARIO */}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* COLUMNA PRINCIPAL (CAMPOS) */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Título */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Título</label>
                            <input
                                type="text"
                                name="title"
                                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Escribe aquí el título de la noticia..."
                                required
                            />
                        </div>

                        {/* Categoría */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Categoría</label>
                            <select
                                name="category"
                                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white transition duration-150"
                                value={formData.category}
                                onChange={handleChange}
                            >
                                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        
                        {/* Contenido */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Contenido</label>
                            <textarea
                                name="content"
                                rows="15"
                                className="w-full border border-gray-300 p-4 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                value={formData.content}
                                onChange={handleChange}
                                placeholder="Redacta el cuerpo completo de la noticia..."
                                required
                            />
                        </div>

                    </div>

                    {/* COLUMNA LATERAL (IMAGEN Y ACCIÓN) */}
                    <div className="lg:col-span-1 space-y-6">
                        
                        {/* IMAGEN DESTACADA */}
                        <div className="p-5 border border-gray-200 rounded-lg bg-white shadow-md">
                            <h3 className="text-md font-bold text-gray-800 mb-3 border-b pb-2">Imagen Destacada</h3>
                            
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                Archivo:
                            </label>
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleFileChange} 
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />

                            {imagePreview && (
                                <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
                                    <img
                                        src={imagePreview}
                                        className="w-full h-40 object-cover"
                                        alt="Vista previa de la imagen destacada"
                                    />
                                    <p className="p-2 text-xs text-center text-gray-600 bg-gray-50">
                                        Vista Previa (Se optimizará a 1MB/1600px)
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* BOTÓN DE PUBLICAR */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 text-lg font-extrabold rounded-lg shadow-xl transition duration-300 transform 
                                ${loading 
                                    ? "bg-gray-400 text-gray-700 cursor-not-allowed" 
                                    : "bg-sky-700 text-white hover:bg-sky-800 hover:scale-[1.01] active:scale-100"
                                }
                            `}
                        >
                            {loading ? "Guardando..." : "Guardar y Publicar Noticia"}
                        </button>

                    </div>
                </form>
            </div>
        </div>
    );
}