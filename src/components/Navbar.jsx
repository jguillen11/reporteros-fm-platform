import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { FaBars, FaTimes, FaEdit, FaSignOutAlt, FaChevronDown } from "react-icons/fa";

function Navbar() {
    const { isLoggedIn, isAdmin, logout } = useAuth();
    const [open, setOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const adminDashboardPath = "/admin/dashboard";

    const handleLogout = () => {
        logout();
        setOpen(false);
        setDropdownOpen(false);
    };

    // Función para cerrar los menús al hacer click en un enlace
    const closeAllMenus = () => {
        setOpen(false);
        setDropdownOpen(false);
    }

    // Lista completa de enlaces (Orden Original)
    const navLinks = [
        { path: "/about", label: "Acerca de nosotros" },
        { path: "/info", label: "Información" },
        { path: "/municipios", label: "Municipios" },
        { path: "/estados", label: "Estados" },
        { path: "/policiacas", label: "Policiacas" },
        { path: "/espectaculos", label: "Espectáculos" },
        { path: "/deportes", label: "Deportes" },
        { path: "/finanzas", label: "Finanzas" },
        { path: "/sur-sureste", label: "Sur-Sureste de Jalisco" },
        { path: "/nacionales", label: "Nacionales" },
        { path: "/cultura", label: "Cultura" },
        { path: "/tonila", label: "Tonila" },
    ];

    // Desktop: Enlaces Primarios (Primeros 5)
    const primaryLinks = navLinks.slice(0, 5);
    // Desktop: Enlaces Secundarios (El resto para el Dropdown)
    const secondaryLinks = navLinks.slice(5);

    return (
        <nav className="w-full bg-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">

                {/* LOGO */}
                <Link to="/" className="flex items-center">
                    <img
                        src="/logo.png"
                        alt="Logo"
                        className="h-20 w-auto object-contain cursor-pointer transition transform hover:scale-[1.05]"
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/120x40/f44336/ffffff?text=NOTICIAS" }}
                    />
                </Link>

                {/* ---------- MENÚ DESKTOP (Estructura Original Simplificada) ---------- */}
                <ul className="hidden md:flex gap-5 text-gray-700 font-medium items-center ml-4">
                    {/* Enlaces Primarios */}
                    {primaryLinks.map((link) => (
                        <li key={link.path}>
                            <Link className="hover:text-red-600 transition duration-150 whitespace-nowrap" to={link.path}>{link.label}</Link>
                        </li>
                    ))}

                    {/* Menú Desplegable para Secciones Adicionales */}
                    <li className="relative">
                        <button
                            className="flex items-center hover:text-red-600 transition duration-150 focus:outline-none whitespace-nowrap"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                        >
                            Más secciones <FaChevronDown className={`ml-1 text-xs transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
                        </button>

                        {dropdownOpen && (
                            <div className="absolute right-0 mt-3 w-64 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-100 origin-top-right">
                                {secondaryLinks.map((link) => (
                                    <Link
                                        key={link.path}
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 whitespace-nowrap"
                                        to={link.path}
                                        onClick={() => setDropdownOpen(false)}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </li>
                </ul>

                {/* ---------- ACCIONES DEL ADMIN (DESKTOP) ---------- */}
                <div className="hidden md:flex items-center gap-3 ml-auto">

                    {isAdmin && (
                        <div className="flex items-center space-x-1">

                            <Link
                                to={adminDashboardPath}
                                className="
                                    bg-red-600 text-white px-3 py-1.5 rounded-full text-sm font-semibold 
                                    shadow-md shadow-red-500/50 hover:bg-red-700 transition-all flex items-center
                                "
                                title="Acceder al Dashboard"
                            >
                                <FaEdit className="mr-1.5 text-base" /> Editor
                            </Link>

                            <button
                                onClick={handleLogout}
                                className="
                                    text-gray-600 border border-red-600/50 px-3 py-1.5 rounded-full text-sm font-medium 
                                    hover:text-red-700 hover:border-red-700 hover:bg-red-50 transition-colors flex items-center
                                "
                                title="Cerrar la sesión de administrador"
                            >
                                <FaSignOutAlt className="mr-1" /> Logout
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


            {/* ---------- PANEL MÓVIL (CORREGIDO PARA SCROLL) ---------- */}
            <div
                // CLASE CLAVE: max-h-[80vh] y overflow-y-auto para permitir scroll
                className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${open ? 'max-h-[80vh] opacity-100 overflow-y-auto' : 'max-h-0 opacity-0'}`}
            >
                <div className="bg-white border-t shadow-inner flex flex-col px-4 pb-4 pt-2 space-y-3 font-medium text-gray-700">
                    {/* Enlaces de Navegación (Orden Original) */}
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            className="hover:text-red-600 py-1 transition"
                            to={link.path}
                            onClick={closeAllMenus}
                        >
                            {link.label}
                        </Link>
                    ))}

                    {/* SEPARADOR Y BOTONES ADMIN */}
                    <div className="border-t pt-4 mt-2 space-y-3">
                        {isAdmin && (
                            <>
                                {/* Botón Modo Editor */}
                                <Link
                                    to={adminDashboardPath}
                                    onClick={closeAllMenus}
                                    className="bg-red-600 text-white text-center px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center shadow-md"
                                >
                                    <FaEdit className="mr-2" /> Modo Editor
                                </Link>
                                {/* Botón Cerrar Sesión */}
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
            </div>
        </nav>
    );
}

export default Navbar;