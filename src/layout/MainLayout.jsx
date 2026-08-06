import Navbar from "../components/Navbar"
import DateBar from "../components/DateBar";
import AdBanner from "../components/AdBanner"
import Footer from "../components/Footer";

function MainLayout({ children }) {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">

            {/* NAVBAR (fijo arriba) */}
            <header className="shadow-md bg-white sticky top-0 z-50">
                <Navbar />
            </header>

            <DateBar />

            <AdBanner
                images={[
                    "/media/zapateria.jpeg",
                    "/media/piloto.jpeg",
                    "/media/obras.jpeg",
                    "/media/torres.jpeg"

                ]}
            />


            {/* CONTENIDO PRINCIPAL */}
            <main className="flex-grow max-w-7xl mx-auto px-4 py-10">
                {children}
            </main>

            {/* FOOTER */}
            <Footer />
        </div>
    );
}

export default MainLayout;
