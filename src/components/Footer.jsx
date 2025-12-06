function Footer() {
    return (
        <footer className="w-full bg-black text-white py-6 mt-10">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <p className="text-sm ">
                    © {new Date().getFullYear()} Reporteros en FM — Todos los derechos reservados
                </p>
                <p className="text-sm">Albert Guillén Gomez</p>
            </div>
        </footer>
    );
}

export default Footer;
