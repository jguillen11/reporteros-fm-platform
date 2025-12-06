import MainLayout from "../layout/MainLayout"

function AboutPage() {
    return (
        <MainLayout>
            <div className="w-full flex flex-col">

                {/* HERO */}
                <div className="w-full h-72 relative">
                    <img
                        src="https://t3.ftcdn.net/jpg/02/46/83/78/360_F_246837879_GLPmzT4BCOE0uBQYzKC5NxvZ2yp0FN7M.jpg"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-white">
                            Acerca de Nosotros
                        </h1>
                    </div>
                </div>

                {/* SECCIÓN PRINCIPAL */}
                <section className="max-w-6xl mx-auto px-4 py-12">

                    <h2 className="text-3xl font-bold text-gray-800 mb-6">Quiénes Somos</h2>

                    <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                        Somos una empresa comprometida con el cambio, la transformación y ante la
                        nueva revolución de ideas con un nuevo modelo periodístico adecuado a los
                        tiempos actuales de la información digital. Es por ello que nuestros lectores,
                        seguidores y anunciantes nos prefieren ante esta realidad y esta es nuestra
                        propuesta y numeralia, de al menos <span className="font-semibold">15 K visitas por día</span> en nuestras diferentes plataformas de Facebook, Twitter e Instagram.
                    </p>

                    {/* SERVICIOS */}
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">Servicios</h2>

                    <p className="text-gray-700 leading-relaxed text-lg mb-4">
                        REPORTEROS EN FM EN LA REGIÓN, JALISCO, COLIMA Y MICHOACÁN
                    </p>

                    <p className="text-gray-700 leading-relaxed text-lg mb-6">
                        Somos una empresa editorial dedicada a informar de manera veraz y oportuna
                        en esta región occidental del país, principalmente a los estados de Jalisco,
                        Colima y Michoacán. Generamos noticias, reportajes, crónica y editoriales
                        fundadas y sustentadas.
                    </p>

                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                        Nuestro principal objetivo: <span className="text-red-600">Informar a la región</span>
                    </h3>

                    {/* LISTA DE VALORES */}
                    <ul className="grid md:grid-cols-2 gap-4 text-gray-700 text-lg">
                        <li className="p-3 bg-gray-100 rounded-lg shadow-sm">• Expresamos ideas</li>
                        <li className="p-3 bg-gray-100 rounded-lg shadow-sm">• Comentamos noticias</li>
                        <li className="p-3 bg-gray-100 rounded-lg shadow-sm">• Desarrollamos información</li>
                        <li className="p-3 bg-gray-100 rounded-lg shadow-sm">• Tenemos ética</li>
                        <li className="p-3 bg-gray-100 rounded-lg shadow-sm">• Tenemos mística</li>
                        <li className="p-3 bg-gray-100 rounded-lg shadow-sm">• Publicitamos eventos</li>
                        <li className="p-3 bg-gray-100 rounded-lg shadow-sm">• Fabricamos publicidad</li>
                        <li className="p-3 bg-gray-100 rounded-lg shadow-sm">• Llegamos a donde otros no pueden</li>
                    </ul>

                </section>

            </div>
        </MainLayout>

    );
}

export default AboutPage;
