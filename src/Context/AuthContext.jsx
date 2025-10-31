import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../client";
import bcrypt from "bcryptjs";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // { id, nombre, email }
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Cargar sesión desde localStorage
        const raw = localStorage.getItem("sessionUser");
        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                if (parsed?.id && parsed?.email) setUser(parsed);
            } catch {
                // ignore
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        // Busca usuario por email y valida contraseña (bcrypt o texto plano)
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', email)
            .single();
        if (error || !data) {
            throw new Error("Credenciales inválidas");
        }

        if (data.estado === false) throw new Error("Cuenta deshabilitada");

        const stored = data.password || "";
        let ok = false;
        if (stored.startsWith("$2a$") || stored.startsWith("$2b$")) {
            ok = await bcrypt.compare(password, stored);
        } else {
            ok = stored === password; // fallback si ya tienes registros sin hash
        }

        if (!ok) throw new Error("Contraseña incorrecta");

        const sessionUser = { uid: data.uid, nombre: data.name, email: data.email, role: data.role };
        localStorage.setItem("sessionUser", JSON.stringify(sessionUser));
        setUser(sessionUser);
        return sessionUser;
    };

    const register = async (nombre, email, password, rol = 'usuario') => {
        // Inserta nuevo usuario con contraseña hasheada
        const hashed = await bcrypt.hash(password, 10);
        const { data, error } = await supabase
            .from('usuarios')
            .insert([{ name: nombre, email, password: hashed, role: rol }])
            .select('*')
            .single();
        if (error) {
            console.error("Error completo de registro:", error);
            if (String(error.message || "").toLowerCase().includes("duplicate") || error.code === '23505') {
                throw new Error("El correo ya está registrado");
            }
            throw new Error(error.message || "No se pudo registrar el usuario");
        }
        return data;
    };

    const logout = async () => {
        localStorage.removeItem("sessionUser");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
