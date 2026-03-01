// src/context/AuthContext.jsx
import { createContext, useContext, useState } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    const login = async (email, password) => {
        const res = await api("/api/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
            throw new Error("Credenciales inválidas");
        }

        const data = await res.json();

        setUser(data.admin);

        // Persistencia simple
        localStorage.setItem("admin", JSON.stringify(data.admin));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("admin");
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