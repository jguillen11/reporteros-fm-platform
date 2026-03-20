import React, { useEffect, useState } from "react";
import MainLayout from "../layout/MainLayout";
import ArticleFlow from "../components/ArticleFlow";
import { api } from "../services/api";

export default function DeportesPage() {
    const [noticias, setNoticias] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNoticias = async () => {
            try {
                const data = await api("/noticias/Deportes");
                setNoticias(data || []);
            } catch (error) {
                console.error("Error obteniendo noticias deportes:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNoticias();
    }, []);

    return (
        <MainLayout>
            <div className="max-w-5xl mx-auto px-6 py-2 bg-white">

                {loading && (
                    <div className="py-16 text-center text-lg italic text-gray-600">
                        Cargando artículos...
                    </div>
                )}

                {!loading && noticias.length === 0 && (
                    <div className="py-16 text-center text-lg text-gray-500 italic">
                        No se encontraron artículos en esta sección.
                    </div>
                )}

                <div>
                    {noticias.map((n) => (
                        <ArticleFlow key={n.id} noticia={n} />
                    ))}
                </div>

            </div>
        </MainLayout>
    );
}