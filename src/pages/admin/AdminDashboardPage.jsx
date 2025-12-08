import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../DB/supabaseClient";

// Función auxiliar para formatear la fecha
const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
};

// 💡 Define el nombre del bucket de Storage para la eliminación (buena práctica)
const BUCKET_NAME = "noticias";

function AdminDashboardPage() {
    const { isAdmin, logout } = useAuth();
    const navigate = useNavigate();
    const [newsList, setNewsList] = useState([]);
    const [message, setMessage] = useState("");
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    // Hook para manejar mensajes de navegación (por ejemplo, después de crear/editar)
    useEffect(() => {
        if (window.history.state && window.history.state.usr && window.history.state.usr.message) {
            setMessage(window.history.state.usr.message);
            setDeleteError(""); // Limpiar errores previos si hay un mensaje de éxito

            // Limpiar el mensaje después de unos segundos
            const timer = setTimeout(() => setMessage(""), 5000);
            return () => clearTimeout(timer);
        }
    }, []);

    // ---------------------------------------
    // 🔥 Cargar Noticias
    // ---------------------------------------
    useEffect(() => {
        if (!isAdmin) {
            navigate("/admin/login", { replace: true });
            return;
        }

        const fetchNews = async () => {
            setIsLoadingData(true);
            let { data, error } = await supabase
                .from("noticias")
                // Asegúrate de seleccionar el image_path para la eliminación en Storage
                .select("id, title, category, created_at, image_path")
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error al cargar noticias:", error);
                setMessage(`❌ Error al cargar las noticias: ${error.message}`);
                setNewsList([]);
            }
            else {
                setNewsList(data || []);
            }
            setIsLoadingData(false);
        };

        fetchNews();
    }, [isAdmin, navigate]);

    // ---------------------------------------
    // 🗑️ Eliminar Noticia (incluyendo Storage)
    // ---------------------------------------
    const handleDelete = async (id, title, image_path) => {
        if (!window.confirm(`¿Estás seguro de ELIMINAR la noticia: "${title}"?\nEsta acción es permanente y borrará la imagen asociada.`)) return;

        setDeleteError("");
        setMessage("");

        try {
            // 1. Intentar borrar la imagen asociada en Storage (si existe)
            if (image_path) {
                const { error: storageError } = await supabase.storage
                    .from(BUCKET_NAME)
                    .remove([image_path]);

                if (storageError) {
                    console.warn(`Advertencia: No se pudo borrar la imagen de Storage (${image_path}):`, storageError);
                }
            }

            // 2. Borrar el registro de la DB
            const { error: dbError } = await supabase
                .from("noticias")
                .delete()
                .eq("id", id);

            if (dbError) throw dbError;

            // Éxito: actualizar la lista en el estado
            setNewsList(newsList.filter(n => n.id !== id));
            setMessage(`Noticia "${title}" eliminada correctamente.`);

        } catch (err) {
            console.error("Error en la eliminación:", err);
            setDeleteError(`❌ Error al eliminar la noticia: ${err.message || "Error desconocido"}`);
        }
    };


    const handleLogout = () => {
        logout();
        navigate("/admin/login");
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8 lg:p-12">
            <div className="max-w-7xl mx-auto">

                {/* Header Profesional */}
                <header className="flex flex-col sm:flex-row justify-between items-start mb-8 border-b border-gray-300 pb-4">
                    <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4 sm:mb-0">
                        📰 Panel de Noticias
                    </h1>

                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-4 sm:mt-0 w-full sm:w-auto">

                        <Link
                            to="/admin/create"
                            className="w-full sm:w-auto bg-sky-700 text-white px-5 py-2 rounded-lg font-medium shadow-md hover:bg-sky-800 transition duration-150 text-center"
                        >
                            + Nueva Noticia
                        </Link>

                        <Link
                            to="/"
                            className="w-full sm:w-auto bg-slate-500 text-white px-5 py-2 rounded-lg font-medium shadow-md hover:bg-slate-600 transition duration-150 text-center"
                        >
                            Ver Sitio Web
                        </Link>

                        {logout && (
                            <button
                                onClick={handleLogout}
                                className="w-full sm:w-auto bg-white text-gray-700 px-5 py-2 border border-gray-300 rounded-lg font-medium shadow-md hover:bg-gray-200 transition duration-150"
                            >
                                Cerrar Sesión
                            </button>
                        )}
                    </div>
                </header>

                {/* Mensajes de Alerta */}
                {message && (
                    <div className="p-4 mb-6 rounded-md shadow-lg bg-green-50 border border-green-300 text-green-800 font-medium">
                        {message}
                    </div>
                )}
                {deleteError && (
                    <div className="p-4 mb-6 rounded-md shadow-lg bg-red-50 border border-red-300 text-red-800 font-medium">
                        {deleteError}
                    </div>
                )}

                {/* Contenedor Principal de Noticias */}
                <div className="bg-white shadow-xl rounded-xl border border-gray-100">
                    <h2 className="text-xl font-semibold p-5 border-b bg-gray-50 text-gray-700">
                        Lista de Noticias ({newsList.length})
                    </h2>

                    {/* Estado de Carga */}
                    {isLoadingData && (
                        <div className="flex justify-center items-center p-8 text-gray-600">
                            <div className="animate-spin w-5 h-5 border-3 border-blue-500 border-t-transparent rounded-full mr-2"></div>
                            Cargando datos...
                        </div>
                    )}

                    {/* Sin Noticias */}
                    {!isLoadingData && newsList.length === 0 ? (
                        <div className="p-10 text-center text-gray-500">
                            <span className="text-4xl block mb-4">📝</span>
                            <p className="text-lg font-medium">No se encontraron noticias publicadas.</p>
                            <p className="text-sm mt-1">Crea tu primera noticia usando el botón '+ Nueva Noticia'.</p>
                        </div>
                    ) : (
                        <>
                            {/* TABLA (Desktop & Tablet: >= md) */}
                            <div className="overflow-x-auto hidden md:block">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID (Ref.)</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Título</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Categoría</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Publicación</th>
                                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>

                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {newsList.map(news => (
                                            <tr key={news.id} className="hover:bg-slate-50 transition duration-100">
                                                <td className="px-6 py-4 text-sm font-mono text-gray-500 w-[10%]">{news.id.substring(0, 8)}...</td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-800 max-w-xs truncate w-[45%]">{news.title}</td>
                                                <td className="px-6 py-4 w-[15%]">
                                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                                        {news.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500 w-[15%]">{formatDate(news.created_at)}</td>

                                                <td className="px-6 py-4 text-center w-[15%]">
                                                    <div className="flex justify-center gap-3">
                                                        <Link
                                                            to={`/admin/edit/${news.id}`}
                                                            className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition duration-150 text-lg"
                                                            title="Editar"
                                                        >
                                                            &#9999;
                                                        </Link>

                                                        <button
                                                            onClick={() => handleDelete(news.id, news.title, news.image_path)}
                                                            className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition duration-150 text-lg"
                                                            title="Eliminar"
                                                        >
                                                            &#128465;
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* LISTA DE TARJETAS (Mobile: < md) */}
                            <div className="p-4 space-y-4 md:hidden">
                                {newsList.map(news => (
                                    <div key={news.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm space-y-2">
                                        <div className="flex justify-between items-start">
                                            {/* Título */}
                                            <h3 className="text-base font-bold text-gray-900 pr-4">{news.title}</h3>

                                            {/* Categoría */}
                                            <span className="flex-shrink-0 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                                {news.category}
                                            </span>
                                        </div>

                                        <p className="text-xs text-gray-500 border-t pt-2">
                                            **Publicación:** {formatDate(news.created_at)}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            **Ref. ID:** {news.id.substring(0, 8)}...
                                        </p>

                                        {/* Acciones */}
                                        <div className="flex justify-end gap-3 border-t pt-3 mt-3">
                                            <Link
                                                to={`/admin/edit/${news.id}`}
                                                className="text-sm font-medium text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition"
                                            >
                                                Editar &#9999;
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(news.id, news.title, news.image_path)}
                                                className="text-sm font-medium text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition"
                                            >
                                                Eliminar &#128465;
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

            </div>
        </div>
    );
}

export default AdminDashboardPage;