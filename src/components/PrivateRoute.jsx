// src/components/PrivateRoutes.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = () => {
    const { isLoggedIn, isAdmin, loading } = useAuth();
    
    // Verificación de emergencia: ¿hay un token físico?
    const hasToken = localStorage.getItem("admin_token");

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    // Permitir paso si el contexto dice OK O si existe el token físicamente
    if (!isLoggedIn && !hasToken) {
        return <Navigate to="/admin/login" replace />;
    }

    // Si quieres ser estricto con el Admin, asegúrate de que el contexto 
    // se actualice correctamente tras el login
    if (!isAdmin && !hasToken) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default PrivateRoute;