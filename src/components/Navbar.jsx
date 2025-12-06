import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { FaBars, FaTimes, FaEdit, FaSignOutAlt, FaUserShield } from "react-icons/fa"; 

function Navbar() {
    const { isLoggedIn, isAdmin, logout } = useAuth(); 
    const [open, setOpen] = useState(false);

    const adminDashboardPath = "/admin/dashboard";

    const handleLogout = () => {
        logout();
        setOpen(false); // Cierra el menú móvil al hacer logout
    };

    return (
        // Navbar ligeramente más alta y con más padding en los lados (py-2, px-6)
        <nav className="w-full bg-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between">

                {/* LOGO */}
                <Link to="/" className="flex items-center">
                    <img
                        src="/logo.png"
                        alt="Logo"
                        className="h-25 w-auto object-contain cursor-pointer hover:scale-[1.1] transition"
                        onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/120x25/f44336/ffffff?text=NOTICIAS" }}
                    />
                </Link>

                {/* ---------- MENÚ DESKTOP ---------- */}
                {/* Aumentamos el gap entre los enlaces de gap-8 a gap-10 */}
                <ul className="hidden md:flex gap-6 text-gray-700 font-medium">
                    <li><Link className="hover:text-red-600 transition duration-150" to="/about">Acerca de nosotros</Link></li>
                    <li><Link className="hover:text-red-600 transition duration-150" to="/policiacas">Policiacas</Link></li>
                    <li><Link className="hover:text-red-600 transition duration-150" to="/deportes">Deportes</Link></li>
                    <li><Link className="hover:text-red-600 transition duration-150" to="/sur-sureste">Sur-Sureste de Jalisco</Link></li>
                </ul>

                {/* ---------- ACCIONES DEL ADMIN (DESKTOP) ---------- */}
                <div className="hidden md:flex items-center gap-4"> 

                    {/* MOSTRAR SOLO SI ES ADMINISTRADOR (isAdmin) */}
                    {isAdmin && (
                        <div className="flex items-center space-x-2">

                            {/* Enlace Modo Editor (Compactado) */}
                            <Link
                                to={adminDashboardPath}
                                className="
                                    bg-red-600 
                                    text-white 
                                    px-3 py-1.5 
                                    rounded-full 
                                    text-sm font-semibold 
                                    shadow-md shadow-red-500/50
                                    hover:bg-red-700 
                                    hover:shadow-lg hover:shadow-red-500/60
                                    transition-all duration-300
                                    flex items-center
                                    focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-opacity-50
                                "
                                title="Acceder al Dashboard"
                            >
                                <FaEdit className="mr-1.5 text-base" /> Modo Editor
                            </Link>

                            {/* Botón Cerrar Sesión (Compactado) */}
                            <button
                                onClick={handleLogout}
                                className="
                                    text-gray-600 
                                    border border-red-600/50 
                                    px-3 py-1.5 
                                    rounded-full 
                                    text-sm font-medium 
                                    hover:text-red-700 
                                    hover:border-red-700 
                                    hover:bg-red-50 
                                    transition-colors duration-300
                                    focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-opacity-50
                                    flex items-center
                                "
                                title="Cerrar la sesión de administrador"
                            >
                                <FaSignOutAlt className="mr-1" /> Cerrar Sesión
                            </button>
                        </div>
                    )}
                </div>

                {/* ---------- MENÚ MÓVIL (Botón) ---------- */}
                <button
                    className="md:hidden text-xl text-gray-700 hover:text-red-600 transition" 
                    onClick={() => setOpen(!open)}
                >
                    {open ? <FaTimes /> : <FaBars />}
                </button>
            </div>


            {/* ---------- PANEL MÓVIL ---------- */}
            {open && (
                <div className="md:hidden bg-white border-t shadow-inner flex flex-col p-4 space-y-4">
                    
                    <Link className="hover:text-red-600 py-1 transition" to="/about" onClick={() => setOpen(false)}>Acerca de nosotros</Link>
                    <Link className="hover:text-red-600 py-1 transition" to="/policiacas" onClick={() => setOpen(false)}>Policiacas</Link>
                    <Link className="hover:text-red-600 py-1 transition" to="/deportes" onClick={() => setOpen(false)}>Deportes</Link>
                    <Link className="hover:text-red-600 py-1 transition" to="/sur-sureste" onClick={() => setOpen(false)}>Sur-Sureste de Jalisco</Link>

                    <div className="border-t pt-4 mt-2 space-y-3">
                        {/* Opciones Móviles para ADMIN (Solo si isAdmin) */}
                        {isAdmin && ( 
                            <>
                                <Link
                                    to={adminDashboardPath}
                                    onClick={() => setOpen(false)}
                                    className="bg-red-600 text-white text-center px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center shadow-md"
                                >
                                    <FaEdit className="mr-2" /> Modo Editor
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="border border-red-600 text-red-600 w-full text-center px-4 py-2 rounded-lg font-semibold hover:bg-red-50 transition flex items-center justify-center"
                                >
                                    <FaSignOutAlt className="mr-2" /> Cerrar Sesión
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}

export default Navbar;