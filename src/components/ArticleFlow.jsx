import React from 'react';

export default function ArticleFlow({ noticia }) {
    
    const { 
        title, 
        content, 
        image_url, 
        created_at 
    } = noticia;

    // Formato de fecha
    const formattedDate = new Date(created_at).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Función para renderizar contenido HTML (si usas editor WYSIWYG)
    const renderContent = () => {
        return { __html: content };
    };

    return (
        // 🟢 CLASE AÑADIDA: w-full para asegurar que el artículo ocupe todo el ancho disponible.
        <article className="border-b border-gray-300 pb-2 pt-6 mb-2 bg-white last:border-b-0 w-full"> 
            
            {/* 1. Metadatos (Solo Fecha) */}
            <div className="text-sm mb-3 text-gray-500">
                <p>Publicado el: <span className="font-medium text-gray-600">{formattedDate}</span></p>
            </div>

            {/* 2. Título Principal y Encabezado */}
            <h2 className="text-3xl font-serif font-extrabold text-gray-900 leading-snug mb-5 border-b border-gray-100 pb-2">
                {title}
            </h2>

            {/* 3. Cuerpo del Artículo COMPLETO */}
            <div 
                className="text-lg text-gray-800 leading-relaxed font-serif mb-6"
                dangerouslySetInnerHTML={renderContent()} 
            />

            {/* 4. Imagen Destacada (Si existe) - Va DESPUÉS del Texto */}
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