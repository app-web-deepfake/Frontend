import React, { createContext, useState, useContext, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem("auth_token");
        const savedUser = localStorage.getItem("auth_user");
        if (savedToken && savedUser) {
            try {
                const parsed = JSON.parse(savedUser);
                // Si el id es objeto (ObjectId viejo), limpiar sesión
                if (parsed?.id && typeof parsed.id === "object") {
                    localStorage.removeItem("auth_token");
                    localStorage.removeItem("auth_user");
                } else {
                    setToken(savedToken);
                    setUser(parsed);
                }
            } catch {
                localStorage.removeItem("auth_token");
                localStorage.removeItem("auth_user");
            }
        }
        setLoading(false);
    }, []);

    const login = (userData, authToken) => {
        setUser(userData);
        setToken(authToken);
        localStorage.setItem("auth_token", authToken);
        localStorage.setItem("auth_user", JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
    };

    const updateUser = (newData) => {
        const updated = { ...user, ...newData };
        setUser(updated);
        localStorage.setItem("auth_user", JSON.stringify(updated));
    };

    const isAuthenticated = !!user && !!token;

    return (
        <AuthContext.Provider value={{ user, token, login, logout, updateUser, isAuthenticated, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    return useContext(AuthContext);
}