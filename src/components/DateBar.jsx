import { useState, useEffect } from 'react';

const getCurrentDate = () => {
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };
    let dateString = new Date().toLocaleDateString('es-MX', options);

    // Capitalizar la primera letra
    // 1. Obtener la primera letra.
    // 2. Convertirla a mayúscula.
    // 3. Concatenarla con el resto del string (desde el segundo carácter).
    if (dateString.length > 0) {
        dateString = dateString.charAt(0).toUpperCase() + dateString.slice(1);
    }

    return dateString;
};

function DateBar() {
    const [currentDate, setCurrentDate] = useState(getCurrentDate());

    useEffect(() => {
        const timerId = setInterval(() => {
            setCurrentDate(getCurrentDate());
        }, 60000);

        return () => {
            clearInterval(timerId);
        };
    }, []);

    return (
        // Barra de fecha con estilos sobrios y responsivos
        <div className="bg-gray-200 border-b border-gray-300 py-2 shadow-sm ">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-sm">

                {/* Lado Izquierdo: Fecha Actual */}
                <p className="text-gray-600 font-medium text-center md:text-left mb-2 md:mb-0 whitespace-nowrap overflow-hidden text-ellipsis">
                    {currentDate}
                </p>

                {/* Lado Derecho: Publicidad (Responsivo) */}
                <div className="px-3 py-1 flex justify-center md:justify-end w-full md:w-auto">
                    <img
                        src="/fiscaliaBan.jpeg"
                        alt="publicidad"
                        className="h-14 sm:h-16 md:h-20 w-auto object-contain"
                    />
                </div>

            </div>
        </div>
    );
}

export default DateBar;