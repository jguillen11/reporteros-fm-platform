import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import { api } from "../services/api";

function HomePage() {
    const [noticias, setNoticias] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const goToCategoryPage = (noticia) => {
        if (!noticia?.category) return;
        const categoryRoute = {
            Informacion: "/info",
            Municipios: "/municipios",
            Estados: "/estados",
            Policiacas: "/policiacas",
            Espectaculos: "/espectaculos",
            Deportes: "/deportes",
            Finanzas: "/finanzas",
            SurSureste: "/sur-sureste",
            Nacionales: "/nacionales",
            Cultura: "/cultura",
        }[noticia.category] || "/";
        navigate(categoryRoute, { state: { noticiaId: noticia.id } });
    };

    useEffect(() => {
        const fetchNoticias = async () => {
            try {
                const data = await api("/noticias");
                setNoticias(data || []);
            } catch (error) {
                console.error("Error al cargar noticias:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNoticias();
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const readTime = (content) => {
        const words = content?.split(" ").length || 0;
        return `${Math.max(1, Math.ceil(words / 200))} min lectura`;
    };

    return (
        <MainLayout>
            <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-6">

                {loading && (
                    <div className="text-center py-24">
                        <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin"></div>
                    </div>
                )}

                {!loading && noticias.length > 0 && (
                    <>
                        {/* SECCIÓN LABEL */}
                        <p className="text-[11px] font-medium tracking-widest uppercase text-gray-400 mb-4">
                            Noticias recientes
                        </p>

                        {/* HERO — NOTICIA PRINCIPAL */}
                        {noticias[0] && (
                            <div
                                onClick={() => goToCategoryPage(noticias[0])}
                                className="relative w-full h-[260px] sm:h-[360px] md:h-[440px] rounded-xl overflow-hidden cursor-pointer mb-8 group"
                            >
                                {noticias[0].image_url ? (
                                    <img
                                        src={noticias[0].image_url}
                                        alt={noticias[0].title}
                                        className="w-full h-full object-cover transition duration-500 group-hover:scale-[1.02]"
                                        style={{ filter: "brightness(0.5)" }}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-950" />
                                )}

                                <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10">
                                    <span className="inline-block text-[10px] font-medium tracking-widest uppercase text-white border border-white/30 bg-white/15 backdrop-blur-sm px-3 py-1 rounded w-fit mb-3">
                                        {noticias[0].category}
                                    </span>
                                    <div className="w-8 h-[2px] bg-white opacity-60 mb-3" />
                                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight mb-2 max-w-3xl">
                                        {noticias[0].title}
                                    </h2>
                                    <p className="text-white/70 text-sm line-clamp-2 max-w-2xl">
                                        {noticias[0].content}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* GRID DE CARDS */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {noticias.slice(1).map((noticia) => (
                                <div
                                    key={noticia.id}
                                    onClick={() => goToCategoryPage(noticia)}
                                    className="bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-gray-400 transition-colors duration-200 group"
                                >
                                    {/* Imagen */}
                                    <div className="h-[110px] overflow-hidden bg-gray-100">
                                        {noticia.image_url ? (
                                            <img
                                                src={noticia.image_url}
                                                alt={noticia.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100" />
                                        )}
                                    </div>

                                    {/* Texto */}
                                    <div className="p-4">
                                        <div className="w-5 h-[1.5px] bg-gray-300 mb-3" />
                                        <p className="text-[10px] font-medium tracking-widest uppercase text-gray-400 mb-1.5">
                                            {noticia.category}
                                        </p>
                                        <h3 className="text-[13px] font-medium text-gray-900 leading-snug line-clamp-2 mb-3">
                                            {noticia.title}
                                        </h3>
                                        <p className="text-[11px] text-gray-400">
                                            {formatDate(noticia.created_at)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {!loading && noticias.length === 0 && (
                    <div className="text-center py-24 text-gray-400 text-sm">
                        No hay noticias publicadas aún.
                    </div>
                )}
            </div>
        </MainLayout>
    );
}

export default HomePage;