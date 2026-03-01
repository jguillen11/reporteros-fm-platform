import React, { useEffect, useState } from "react";
import MainLayout from "../layout/MainLayout";
import ArticleFlow from "../components/ArticleFlow";
import { api } from "../services/api";

export default function CulturaPage() {
    const [noticias, setNoticias] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNoticias = async () => {
            try {
                const res = await api("/api/noticias/Cultura");
                if (!res.ok) {
                    throw new Error("Error en la respuesta del servidor");
                }

                const data = await res.json();
                setNoticias(data);
            } catch (error) {
                console.error("Error obteniendo noticias Cultura:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNoticias();
    }, []);

    return (
        <MainLayout>
            <div className="max-w-5xl mx-auto px-6 py-2 bg-white">

                {/* ESTADO: CARGANDO */}
                {loading && (
                    <div className="py-20 text-center">
                        <p className="text-xl text-gray-700 italic">
                            Cargando artículos...
                        </p>
                    </div>
                )}

                {/* ESTADO: VACÍO */}
                {!loading && noticias.length === 0 && (
                    <div className="py-20 text-center">
                        <p className="text-xl text-gray-500 italic">
                            No hay noticias en esta categoría.
                        </p>
                    </div>
                )}

                {/* LISTA DE ARTÍCULOS */}
                <div>
                    {noticias.map((n) => (
                        <ArticleFlow key={n.id} noticia={n} />
                    ))}
                </div>
            </div>
        </MainLayout>
    );
}