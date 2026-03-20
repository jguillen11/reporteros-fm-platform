import React, { useState } from 'react';

export default function ArticleFlow({ noticia }) {

    const { title, content, image_url, images, created_at } = noticia;

    const formattedDate = new Date(created_at).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const [expanded, setExpanded] = useState(false);
    const [lightbox, setLightbox] = useState(null); // URL de imagen en lightbox

    // Combinar portada + galería para el grid
    const galleryImages = [];
    if (image_url) galleryImages.push(image_url);
    if (Array.isArray(images)) galleryImages.push(...images);

    return (
        <article className="flex flex-col bg-white py-6 mb-4 border-b border-gray-200 last:border-b-0 w-full max-w-5xl mx-auto px-2 sm:px-4 lg:px-0">

            {/* FECHA */}
            <div className="text-[0.65rem] sm:text-xs font-light text-gray-500 mb-2 tracking-wide">
                <span className="uppercase mr-1">Publicado el:</span>
                <span className="font-medium text-gray-600">{formattedDate}</span>
            </div>

            {/* TÍTULO */}
            <h2 className="font-serif font-black text-gray-900 leading-tight text-justify mb-4 tracking-tight text-[clamp(1.2rem,4vw,3rem)]">
                {title}
            </h2>

            {/* CONTENIDO */}
            <div className="relative">
                <div className={`text-[clamp(0.85rem,2vw,1.2rem)] text-gray-800 leading-relaxed font-serif transition-all duration-700 text-justify overflow-hidden mb-3 ${expanded ? "max-h-none" : "max-h-[28vh] sm:max-h-[35vh]"}`}>
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                </div>
                {!expanded && (
                    <div className="absolute bottom-2 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                )}
            </div>

            {/* BOTÓN LEER MÁS */}
            <button
                className="text-gray-700 font-medium hover:text-black cursor-pointer transition-colors duration-200 text-[clamp(0.8rem,2vw,1.1rem)] mt-1 underline"
                onClick={() => setExpanded(!expanded)}
            >
                {expanded ? "Ocultar contenido ▲" : "Continuar leyendo ▼"}
            </button>

            {/* GALERÍA DE IMÁGENES */}
            {galleryImages.length === 1 && (
                <figure className="w-full my-6 pt-3 flex justify-center">
                    <img
                        src={galleryImages[0]}
                        alt={`Imagen: ${title}`}
                        onClick={() => setLightbox(galleryImages[0])}
                        className="w-full max-w-[900px] max-h-[380px] object-cover shadow-md rounded-md cursor-zoom-in hover:opacity-95 transition"
                        onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                    />
                </figure>
            )}

            {galleryImages.length === 2 && (
                <div className="grid grid-cols-2 gap-2 my-6">
                    {galleryImages.map((url, i) => (
                        <img
                            key={i}
                            src={url}
                            alt={`Imagen ${i + 1}`}
                            onClick={() => setLightbox(url)}
                            className="w-full h-52 object-cover rounded-md shadow-sm cursor-zoom-in hover:opacity-95 transition"
                            onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                        />
                    ))}
                </div>
            )}

            {galleryImages.length === 3 && (
                <div className="grid grid-cols-3 gap-2 my-6">
                    {galleryImages.map((url, i) => (
                        <img
                            key={i}
                            src={url}
                            alt={`Imagen ${i + 1}`}
                            onClick={() => setLightbox(url)}
                            className="w-full h-48 object-cover rounded-md shadow-sm cursor-zoom-in hover:opacity-95 transition"
                            onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                        />
                    ))}
                </div>
            )}

            {galleryImages.length >= 4 && (
                <div className="grid grid-cols-2 gap-2 my-6">
                    {/* Primera imagen más grande */}
                    <div className="col-span-2">
                        <img
                            src={galleryImages[0]}
                            alt="Imagen principal"
                            onClick={() => setLightbox(galleryImages[0])}
                            className="w-full h-64 object-cover rounded-md shadow-sm cursor-zoom-in hover:opacity-95 transition"
                            onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                        />
                    </div>
                    {/* Resto en grid de 2 columnas */}
                    {galleryImages.slice(1).map((url, i) => (
                        <img
                            key={i}
                            src={url}
                            alt={`Imagen ${i + 2}`}
                            onClick={() => setLightbox(url)}
                            className="w-full h-40 object-cover rounded-md shadow-sm cursor-zoom-in hover:opacity-95 transition"
                            onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                        />
                    ))}
                </div>
            )}

            {/* LIGHTBOX */}
            {lightbox && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setLightbox(null)}
                >
                    <button
                        className="absolute top-4 right-5 text-white text-3xl font-bold hover:text-gray-300 transition"
                        onClick={() => setLightbox(null)}
                    >
                        ×
                    </button>
                    <img
                        src={lightbox}
                        alt="Imagen ampliada"
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

        </article>
    );
}