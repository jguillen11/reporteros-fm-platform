import React, { useEffect, useState } from "react";
import MainLayout from "../layout/MainLayout";
import ArticleFlow from "../components/ArticleFlow";
import { api } from "../services/api";

export default function PoliciacasPage() {

    const [noticias, setNoticias] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNoticias = async () => {
            try {
                const data = await api("/noticias/Policiacas");
                setNoticias(data || []);
            } catch (error) {
                console.error("Error obteniendo noticias policiacas:", error);
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
                    <div className="py-20 text-center">
                        <p className="text-xl text-gray-700 italic">
                            Cargando artículos...
                        </p>
                    </div>
                )}

                {!loading && noticias.length === 0 && (
                    <div className="py-20 text-center">
                        <p className="text-xl text-gray-500 italic">
                            No hay noticias en esta categoría.
                        </p>
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