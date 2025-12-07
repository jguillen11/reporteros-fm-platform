import { useState, useEffect } from 'react';

const getCurrentDate = () => {
    const options = {
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
    };
    return new Date().toLocaleDateString('es-MX', options);
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

                {/* Lado Derecho: Espacio para Publicidad (Para implementar más adelante) */}
                <div className="px-3 py-1 cursor-pointer">
                    <img src="https://0201.nccdn.net/4_2/000/000/01e/20c/1bannerfgecoli21-11-2025.jpg" alt="publicidad" className='h-20'/>
                </div>
            </div>
        </div>
    );
}

export default DateBar;