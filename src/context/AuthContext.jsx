import { createContext, useContext, useState, useEffect, useMemo } from "react";

// 1. Definimos el contexto con valores por defecto reales
const AuthContext = createContext({
    user: null,
    isLoggedIn: false,
    isAdmin: false,
    login: () => { }, // Función vacía para que nunca sea "not a function"
    logout: () => { },
    loading: true
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem("admin");
        if (savedUser) {
            try {
                const parsed = JSON.parse(savedUser);
                setUser(parsed);
            } catch (e) {
                localStorage.removeItem("admin");
            }
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem("admin", JSON.stringify(userData));
        localStorage.setItem("admin_token", userData.id);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("admin");
        localStorage.removeItem("admin_token");
    };

    // 2. Memorizamos el valor para evitar re-renders innecesarios y asegurar la referencia
    const value = useMemo(() => ({
        user,
        isLoggedIn: !!user,
        isAdmin: user?.role === "admin",
        login,
        logout,
        loading,
    }), [user, loading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        console.error("useAuth fue llamado fuera de su Provider");
    }
    return context;
};