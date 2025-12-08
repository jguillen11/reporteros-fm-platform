import React, { useEffect, useState } from "react";
import MainLayout from "../layout/MainLayout";
import ArticleFlow from "../components/ArticleFlow";
import { supabase } from "../DB/supabaseClient";

export default function SurSurestePage() {

    const [noticias, setNoticias] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const fetchNoticias = async () => {
            const { data, error } = await supabase
                .from("noticias")
                .select("*")
                .eq("category", "Cultura")
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error obteniendo noticias Cultura:", error);
                setLoading(false);
                return;
            }

            setNoticias(data);
            setLoading(false);
        };

        fetchNoticias();
    }, []);

    return (
        <MainLayout>
            <div className="max-w-5xl mx-auto px-6 py-2 bg-white">

                {/* ESTADOS */}
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

                {/* LISTA COMPLETA DE ARTÍCULOS */}
                <div>
                    {noticias.map((n) => (
                        <ArticleFlow key={n.id} noticia={n} />
                    ))}
                </div>
            </div>
        </MainLayout>
    );
}
