import React, { useState } from 'react';

export default function ArticleFlow({ noticia }) {

    const { title, content, image_url, images, created_at } = noticia;

    const formattedDate = new Date(created_at).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const readTime = () => {
        const words = content?.split(" ").length || 0;
        return `${Math.max(1, Math.ceil(words / 200))} min lectura`;
    };

    const [expanded, setExpanded] = useState(false);
    const [lightbox, setLightbox] = useState(null);

    const galleryImages = [];
    if (image_url) galleryImages.push(image_url);
    if (Array.isArray(images)) galleryImages.push(...images);

    return (
        <article className="py-5 border-b border-gray-100 last:border-b-0 w-full max-w-5xl mx-auto">

            {/* LAYOUT: texto izquierda, thumbnail derecha */}
            <div className="flex gap-4 items-start">

                {/* CONTENIDO IZQUIERDA */}
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-medium tracking-widest uppercase text-gray-400 mb-2">
                        {noticia.category}
                    </p>

                    <h2 className="font-semibold text-gray-900 leading-snug mb-2 text-[clamp(1rem,2.5vw,1.4rem)]">
                        {title}
                    </h2>

                    {/* Extracto siempre visible */}
                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-3">
                        {content?.replace(/<[^>]+>/g, "").slice(0, 160)}...
                    </p>

                    {/* Metadatos */}
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-[11px] text-gray-400">{formattedDate}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300 inline-block" />
                        <span className="text-[11px] text-gray-400">{readTime()}</span>
                    </div>

                    {/* Botón leer más */}
                    <button
                        className="text-[12px] font-medium text-gray-500 hover:text-gray-900 transition-colors underline underline-offset-2"
                        onClick={() => setExpanded(!expanded)}
                    >
                        {expanded ? "Ocultar ▲" : "Leer completo ▼"}
                    </button>
                </div>

                {/* THUMBNAIL DERECHA */}
                {galleryImages[0] && (
                    <div
                        className="flex-shrink-0 w-20 h-16 sm:w-24 sm:h-[72px] rounded-lg overflow-hidden bg-gray-100 cursor-zoom-in"
                        onClick={() => setLightbox(galleryImages[0])}
                    >
                        <img
                            src={galleryImages[0]}
                            alt={title}
                            className="w-full h-full object-cover hover:scale-105 transition duration-300"
                            onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                        />
                    </div>
                )}
            </div>

            {/* CONTENIDO EXPANDIDO */}
            {expanded && (
                <div className="mt-4">
                    <div
                        className="text-[clamp(0.85rem,2vw,1rem)] text-gray-700 leading-relaxed font-serif text-justify"
                        dangerouslySetInnerHTML={{ __html: content }}
                    />

                    {/* GALERÍA */}
                    {galleryImages.length === 1 && (
                        <figure className="mt-5">
                            <img
                                src={galleryImages[0]}
                                alt={title}
                                onClick={() => setLightbox(galleryImages[0])}
                                className="w-full max-h-[360px] object-cover rounded-lg cursor-zoom-in hover:opacity-95 transition"
                                onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                            />
                        </figure>
                    )}

                    {galleryImages.length === 2 && (
                        <div className="grid grid-cols-2 gap-2 mt-5">
                            {galleryImages.map((url, i) => (
                                <img key={i} src={url} alt={`img-${i}`}
                                    onClick={() => setLightbox(url)}
                                    className="w-full h-48 object-cover rounded-lg cursor-zoom-in hover:opacity-95 transition"
                                    onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                                />
                            ))}
                        </div>
                    )}

                    {galleryImages.length === 3 && (
                        <div className="grid grid-cols-3 gap-2 mt-5">
                            {galleryImages.map((url, i) => (
                                <img key={i} src={url} alt={`img-${i}`}
                                    onClick={() => setLightbox(url)}
                                    className="w-full h-40 object-cover rounded-lg cursor-zoom-in hover:opacity-95 transition"
                                    onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                                />
                            ))}
                        </div>
                    )}

                    {galleryImages.length >= 4 && (
                        <div className="grid grid-cols-2 gap-2 mt-5">
                            <div className="col-span-2">
                                <img src={galleryImages[0]} alt="portada"
                                    onClick={() => setLightbox(galleryImages[0])}
                                    className="w-full h-56 object-cover rounded-lg cursor-zoom-in hover:opacity-95 transition"
                                    onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                                />
                            </div>
                            {galleryImages.slice(1).map((url, i) => (
                                <img key={i} src={url} alt={`img-${i + 2}`}
                                    onClick={() => setLightbox(url)}
                                    className="w-full h-36 object-cover rounded-lg cursor-zoom-in hover:opacity-95 transition"
                                    onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* LIGHTBOX */}
            {lightbox && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setLightbox(null)}
                >
                    <button
                        className="absolute top-4 right-5 text-white text-3xl font-light hover:text-gray-300 transition"
                        onClick={() => setLightbox(null)}
                    >
                        ×
                    </button>
                    <img
                        src={lightbox}
                        alt="Imagen ampliada"
                        className="max-w-full max-h-[90vh] object-contain rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

        </article>
    );
}