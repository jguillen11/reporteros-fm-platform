import React, { useState } from 'react';

export default function ArticleFlow({ noticia }) {

    const { 
        title, 
        content, 
        image_url, 
        created_at 
    } = noticia;

    const formattedDate = new Date(created_at).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const [expanded, setExpanded] = useState(false);

    return (
        <article className="border-b border-gray-300 pb-2 pt-6 mb-2 max-w-200 bg-white last:border-b-0 w-full">

            {/* FECHA */}
            <div className="text-sm mb-3 text-gray-500">
                <p>
                    Publicado el:{" "}
                    <span className="font-medium text-gray-600">{formattedDate}</span>
                </p>
            </div>

            {/* TÍTULO */}
            <h2 className="text-3xl font-serif font-extrabold text-gray-900 leading-snug mb-5 border-b border-gray-100 pb-2">
                {title}
            </h2>

            {/* CONTENIDO (COLAPSABLE EN TODAS LAS VISTAS) */}
            <div
                className={`
                    text-lg text-justify text-gray-800 leading-relaxed font-serif mb-4 transition-all duration-500
                    overflow-hidden
                    ${expanded ? "max-h-none" : "max-h-48"}
                `}
            >
                <div dangerouslySetInnerHTML={{ __html: content }} />
            </div>

            {/* BOTÓN — AHORA VISIBLE EN TODAS LAS VISTAS */}
            <button
                className="text-red-600 font-semibold underline mt-2 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                {expanded ? "Leer menos ▲" : "Leer más ▼"}
            </button>

            {/* IMAGEN */}
            {image_url && (
                <figure className="w-full my-4 pt-6">
                    <img
                        src={image_url}
                        alt={`Imagen destacada: ${title}`}
                        className="w-full max-h-[450px] object-cover mx-auto rounded"
                        onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                    />
                </figure>
            )}

        </article>
    );
}
