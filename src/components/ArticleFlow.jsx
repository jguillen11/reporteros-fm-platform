import React, { useState } from 'react';

export default function ArticleFlow({ noticia }) {

    const { 
        title, 
        content, 
        image_url, 
        created_at 
    } = noticia;

    // Formateo de fecha en español
    const formattedDate = new Date(created_at).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const [expanded, setExpanded] = useState(false);

    return (
        // CONTENEDOR PRINCIPAL: Estilo de flujo minimalista (separador inferior)
        <article className="
            flex flex-col 
            bg-white 
            py-8 
            mb-4 
            border-b 
            border-gray-200 
            last:border-b-0 
            w-full 
            max-w-4xl 
            mx-auto
        ">

            {/* METADATOS (Fecha - Arriba, discreta) */}
            <div className="text-sm font-light text-gray-500 mb-3 tracking-wide">
                <span className="uppercase mr-2">Publicado el:</span>
                <span className="font-medium text-gray-600">{formattedDate}</span>
            </div>

            {/* TÍTULO (Grande y destacado) */}
            <h2 className="
                text-4xl 
                md:text-5xl 
                font-serif 
                font-black 
                text-gray-900 
                leading-tight 
                mb-6 
                tracking-tighter
            ">
                {title}
            </h2>

            {/* *** CONTENEDOR DE CONTENIDO RELATIVO PARA EL DEGRADADO *** */}
            <div className="relative"> 
                {/* CONTENIDO (COLAPSABLE - Cuerpo de texto principal) */}
                <div
                    className={`
                        text-xl 
                        text-gray-800 
                        leading-relaxed 
                        font-serif 
                        transition-all 
                        duration-700 
                        overflow-hidden 
                        mb-4
                        ${expanded ? "max-h-none" : "max-h-40"}
                    `}
                >
                    {/* Renderiza el contenido HTML */}
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                </div>

                {/* *** DEGRADADO (OVERLAY) QUE SIMULA LOS PUNTOS SUSPENSIVOS *** */}
                {!expanded && (
                    <div className="
                        absolute 
                        bottom-4 
                        left-0 
                        right-0 
                        h-12 
                        bg-gradient-to-t 
                        from-white 
                        to-transparent
                        pointer-events-none
                    "></div>
                )}
            </div>

            {/* BOTÓN DE EXPANSIÓN (Color discreto) */}
            <button
                className="
                    text-gray-700 
                    font-medium 
                    hover:text-black 
                    transition-colors 
                    duration-200 
                    text-lg 
                    mt-2
                "
                onClick={() => setExpanded(!expanded)}
            >
                {expanded ? "Ocultar contenido ▲" : "Continuar leyendo ▼"}
            </button>
            
            {/* IMAGEN DE BANNER (Después del texto y botón) */}
            {image_url && (
                <figure className="w-full my-8 pt-4">
                    <img
                        src={image_url}
                        alt={`Imagen destacada: ${title}`}
                        className="w-full max-h-[500px] object-cover mx-auto shadow-md"
                        onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                    />
                </figure>
            )}

        </article>
    );
}