// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../DB/supabaseClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const session = supabase.auth.getSession().then(({ data }) => {
            setCurrentUser(data.session?.user || null);
            setLoading(false);
        });

        const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
            setCurrentUser(session?.user || null);
        });

        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    const isLoggedIn = currentUser !== null;
    const isAdmin = currentUser?.email === "reporterosenfm@admin.com"; 

    const logout = async () => {
        await supabase.auth.signOut();
        setCurrentUser(null);
    };

    return (
        <AuthContext.Provider value={{ currentUser, isLoggedIn, isAdmin, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
