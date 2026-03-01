// src/components/PrivateRoutes.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = () => {
    const { isLoggedIn, isAdmin, loading } = useAuth();

    // ⏳ Esperar a que el auth se inicialice
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    // 🔒 No autenticado
    if (!isLoggedIn) {
        return <Navigate to="/admin/login" replace />;
    }

    // 🚫 No admin
    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    // ✅ Autorizado
    return <Outlet />;
};

export default PrivateRoute;