import React, { useEffect, useRef } from "react";

export default function AdBanner({ images = [], interval = 3500 }) {

    const banners = images; // ya no limitamos a 5
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container || banners.length === 0) return;

        let index = 0;

        const autoScroll = setInterval(() => {
            // Solo auto-scroll en móvil
            if (window.innerWidth >= 768) return;

            index = (index + 1) % banners.length;

            container.scrollTo({
                left: container.clientWidth * index,
                behavior: "smooth",
            });
        }, interval);

        return () => clearInterval(autoScroll);
    }, [banners.length, interval]);

    return (
        <section className="w-full bg-gray-100 border-y border-gray-300">
            <div className="max-w-7xl mx-auto px-4 py-3">

                {/* MÓVIL: carrusel | DESKTOP: grid dinámico */}
                <div
                    ref={containerRef}
                    className="
                        flex md:grid
                        md:grid-flow-col
                        md:auto-cols-fr
                        gap-4
                        overflow-x-auto md:overflow-visible
                        snap-x snap-mandatory
                        scrollbar-hide
                    "
                >
                    {banners.map((img, index) => (
                        <div
                            key={index}
                            className="
                                flex-shrink-0 md:flex-shrink
                                w-full md:w-auto
                                h-[180px]
                                flex items-center justify-center
                                px-2
                                snap-center
                            "
                        >
                            <img
                                src={img}
                                alt={`Publicidad ${index + 1}`}
                                className="max-h-full max-w-full object-contain"
                            />
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
