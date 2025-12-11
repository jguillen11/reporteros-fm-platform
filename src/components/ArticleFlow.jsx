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
        <article
            className="
                flex flex-col 
                bg-white 
                py-6 
                mb-4 
                border-b 
                border-gray-200 
                last:border-b-0 
                w-full 
                max-w-5xl 
                mx-auto
                px-2
                sm:px-4
                lg:px-0
            "
        >

            {/* FECHA */}
            <div className="text-[0.65rem] sm:text-xs font-light text-gray-500 mb-2 tracking-wide">
                <span className="uppercase mr-1">Publicado el:</span>
                <span className="font-medium text-gray-600">{formattedDate}</span>
            </div>

            {/* TÍTULO */}
            <h2
                className="
                    font-serif 
                    font-black 
                    text-gray-900 
                    leading-tight
                    text-justify 
                    mb-4 
                    tracking-tight
                    text-[clamp(1.2rem,4vw,3rem)]
                "
            >
                {title}
            </h2>

            {/* CONTENIDO */}
            <div className="relative">
                <div
                    className={`
                        text-[clamp(0.85rem,2vw,1.2rem)]
                        text-gray-800 
                        leading-relaxed 
                        font-serif 
                        transition-all 
                        duration-700 
                        text-justify
                        overflow-hidden 
                        mb-3
                        ${
                            expanded
                                ? "max-h-none"
                                : "max-h-[28vh] sm:max-h-[35vh]"
                        }
                    `}
                >
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                </div>

                {!expanded && (
                    <div
                        className="
                            absolute 
                            bottom-2 
                            left-0 
                            right-0 
                            h-16 
                            bg-gradient-to-t 
                            from-white 
                            to-transparent
                            pointer-events-none
                        "
                    ></div>
                )}
            </div>

            {/* BOTÓN */}
            <button
                className="
                    text-gray-700 
                    font-medium 
                    hover:text-black
                    cursor-pointer 
                    transition-colors 
                    duration-200 
                    text-[clamp(0.8rem,2vw,1.1rem)]
                    mt-1
                    underline
                "
                onClick={() => setExpanded(!expanded)}
            >
                {expanded ? "Ocultar contenido ▲" : "Continuar leyendo ▼"}
            </button>

            {/* IMAGEN */}
            {image_url && (
                <figure className="w-full my-6 pt-3 flex justify-center">
                    <img
                        src={image_url}
                        alt={`Imagen destacada: ${title}`}
                        className="
                            w-full 
                            max-w-[900px]
                            max-h-[380px] 
                            object-cover 
                            shadow-md
                            rounded-md
                        "
                        onError={(e) => { 
                            e.target.onerror = null; 
                            e.target.style.display = 'none'; 
                        }}
                    />
                </figure>
            )}

        </article>
    );
}
