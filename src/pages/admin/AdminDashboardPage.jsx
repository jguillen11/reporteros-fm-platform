import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";

// Función auxiliar para formatear la fecha
const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("es-ES", options);
};

function AdminDashboardPage() {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const [newsList, setNewsList] = useState([]);
    const [message, setMessage] = useState("");
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    // 🔐 Proteger ruta
    useEffect(() => {
        if (!isAuthenticated()) {
            navigate("/admin/login", { replace: true });
        }
    }, []);

    // ---------------------------------------
    // 🔥 Cargar Noticias (NEON)
    // ---------------------------------------
    useEffect(() => {
        const fetchNews = async () => {
            setIsLoadingData(true);
            setDeleteError("");
            setMessage("");

            try {
                const res = await api("/api/noticias/admin");

                if (!res.ok) {
                    throw new Error("Error al cargar noticias");
                }

                const data = await res.json();
                setNewsList(data || []);
            } catch (err) {
                console.error(err);
                setDeleteError("Error al cargar las noticias.");
                setNewsList([]);
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchNews();
    }, []);

    // ---------------------------------------
    // 🗑️ Eliminar Noticia (NEON)
    // ---------------------------------------
    const handleDelete = async (id, title) => {
        const confirmDelete = window.confirm(
            `¿Estás seguro de ELIMINAR la noticia: "${title}"?\nEsta acción es permanente.`
        );
        if (!confirmDelete) return;

        setDeleteError("");
        setMessage("");

        try {
            const res = await api(`/api/noticias/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                throw new Error("Error al eliminar");
            }

            setNewsList((prev) => prev.filter((n) => n.id !== id));
            setMessage(`Noticia "${title}" eliminada correctamente.`);
        } catch (err) {
            console.error(err);
            setDeleteError("Error al eliminar la noticia.");
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/admin/login");
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8 lg:p-12">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <header className="flex flex-col sm:flex-row justify-between items-start mb-8 border-b border-gray-300 pb-4">
                    <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4 sm:mb-0">
                        📰 Panel de Noticias
                    </h1>

                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <Link
                            to="/admin/create"
                            className="bg-sky-700 text-white px-5 py-2 rounded-lg font-medium shadow-md hover:bg-sky-800 text-center"
                        >
                            + Nueva Noticia
                        </Link>

                        <Link
                            to="/"
                            className="bg-slate-500 text-white px-5 py-2 rounded-lg font-medium shadow-md hover:bg-slate-600 text-center"
                        >
                            Ver Sitio Web
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="bg-white text-gray-700 px-5 py-2 border border-gray-300 rounded-lg font-medium shadow-md hover:bg-gray-200"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </header>

                {/* Mensajes */}
                {message && (
                    <div className="p-4 mb-6 rounded-md bg-green-50 border border-green-300 text-green-800">
                        {message}
                    </div>
                )}

                {deleteError && (
                    <div className="p-4 mb-6 rounded-md bg-red-50 border border-red-300 text-red-800">
                        {deleteError}
                    </div>
                )}

                {/* Contenedor principal */}
                <div className="bg-white shadow-xl rounded-xl border">
                    <h2 className="text-xl font-semibold p-5 border-b bg-gray-50">
                        Lista de Noticias ({newsList.length})
                    </h2>

                    {isLoadingData && (
                        <div className="p-8 text-center text-gray-600">
                            Cargando noticias...
                        </div>
                    )}

                    {!isLoadingData && newsList.length === 0 ? (
                        <div className="p-10 text-center text-gray-500">
                            No hay noticias registradas.
                        </div>
                    ) : (
                        <div className="overflow-x-auto hidden md:block">
                            <table className="min-w-full divide-y">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold">Título</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold">Categoría</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold">Fecha</th>
                                        <th className="px-6 py-3 text-center text-xs font-semibold">Acciones</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {newsList.map((news) => (
                                        <tr key={news.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-mono">
                                                {news.id.substring(0, 8)}...
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium">
                                                {news.title}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                {news.category}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                {formatDate(news.created_at)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center gap-3">
                                                    <Link
                                                        to={`/admin/edit/${news.id}`}
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        ✏️
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(news.id, news.title)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        🗑
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminDashboardPage;