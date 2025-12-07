import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from "../layout/MainLayout";
import { supabase } from '../DB/supabaseClient';

function HomePage() {
    const [noticias, setNoticias] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    const goToCategoryPage = (noticia) => {
        if (!noticia?.category) return;

        const categoryRoute = {
            Policiacas: "/policiacas",
            Deportes: "/deportes",
            SurSureste: "/sur-sureste",
            Nacionales: "/nacionales",
        }[noticia.category] || "/";

        navigate(categoryRoute, { state: { noticiaId: noticia.id } });
    };

    useEffect(() => {
        const fetchNoticias = async () => {
            const { data, error } = await supabase
                .from('noticias')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error al cargar noticias:", error);
            } else {
                setNoticias(data);
            }

            setLoading(false);
        };

        fetchNoticias();
    }, []);

    return (
        <MainLayout>
            <div className="w-full max-w-[1500px] mx-auto px-6 py-2">

                {loading && (
                    <div className="text-center p-20 text-lg font-semibold animate-pulse">
                        Cargando noticias...
                    </div>
                )}

                <h1 className="text-4xl font-black text-gray-900 mb-14 tracking-tight">
                    Noticias Recientes
                </h1>

                {/* NOTICIA PRINCIPAL (MISMO ESTILO, PERO RESPONSIVA) */}
                {noticias[0] && (
                    <div
                        onClick={() => goToCategoryPage(noticias[0])}
                        className="relative mb-20 cursor-pointer rounded-3xl overflow-hidden shadow-2xl group h-[380px] sm:h-[460px] md:h-[500px]"
                    >
                        <img
                            src={noticias[0].image_url}
                            alt={noticias[0].title}
                            className="w-full h-full object-cover brightness-75 group-hover:brightness-90 transition duration-300"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparentp-6 sm:p-10 flex flex-col justify-end">
                            <span className="text-[10px] sm:text-xs tracking-widest uppercase font-bold px-3 py-1 bg-white/20 rounded-md w-fit backdrop-blur-sm">
                                {noticias[0].category}
                            </span>

                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mt-3 leading-tight drop-shadow-lg">
                                {noticias[0].title}
                            </h2>

                            <p className="text-gray-200 text-sm sm:text-base mt-3 opacity-90 max-w-3xl line-clamp-3">
                                {noticias[0].content}
                            </p>

                            <span className="text-white text-sm sm:text-base mt-4 underline opacity-80 group-hover:opacity-100">
                                Leer noticia →
                            </span>
                        </div>
                    </div>
                )}


                {/* GRID DE TARJETAS */}
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
                    {noticias.slice(1).map(noticia => (
                        <div
                            key={noticia.id}
                            onClick={() => goToCategoryPage(noticia)}
                            className="cursor-pointer transform transition duration-300 hover:-translate-y-2 hover:shadow-2xl bg-white rounded-2xl overflow-hidden border border-gray-200"
                        >
                            <div className="h-44 overflow-hidden">
                                <img
                                    src={noticia.image_url}
                                    alt={noticia.title}
                                    className="w-full h-full object-cover hover:scale-110 transition duration-500"
                                />
                            </div>

                            <div className="p-5">
                                <span className="text-xs font-bold text-sky-700 uppercase tracking-widest">
                                    {noticia.category}
                                </span>

                                <h3 className="font-black text-lg mt-2 line-clamp-2">
                                    {noticia.title}
                                </h3>

                                <p className="text-gray-600 text-sm mt-2 line-clamp-3">
                                    {noticia.content}
                                </p>

                                <div className="mt-4 text-sky-600 font-semibold text-sm">
                                    Leer más →
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </MainLayout>
    );
}

export default HomePage;
