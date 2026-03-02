import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Iniciamos en true para validar sesión

    // 🔄 Recuperar sesión al cargar la app
    useEffect(() => {
        const savedUser = localStorage.getItem("admin");
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        setUser(userData);
        // Guardamos el objeto completo para tener el id y el role
        localStorage.setItem("admin", JSON.stringify(userData));
        localStorage.setItem("admin_token", userData.id);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("admin");
        localStorage.removeItem("admin_token");
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoggedIn: !!user,
                isAdmin: user?.role === "admin",
                login,
                logout,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);