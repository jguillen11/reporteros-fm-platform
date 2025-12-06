import React, { useEffect, useState } from "react";
import MainLayout from "../layout/MainLayout";
import ArticleFlow from "../components/ArticleFlow";
import { supabase } from "../DB/supabaseClient";

export default function DeportesPage() {

    const [noticias, setNoticias] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const fetchNoticias = async () => {
            const { data, error } = await supabase
                .from("noticias")
                .select("*")
                .eq("category", "Deportes")
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error obteniendo Deportes:", error);
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