import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../../Firebase/config";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
    role: "reportero", // valor por defecto
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validación mínima
    if (!form.username.trim() || !form.email.trim() || !form.password.trim()) {
      setError("Por favor completa todos los campos.");
      return;
    }

    if (form.password !== form.confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      
      //Crear usuario en Firebase Authentication
      const userCred = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      setForm({
        username: "",
        email: "",
        password: "",
        confirm: "",
        role: "reportero",
      });

      
      await updateProfile(userCred.user, {
        displayName: form.username,
      });

      // crear documento en Firestore con rol
      await setDoc(doc(db, "Usuarios", userCred.user.uid), {
        uid: userCred.user.uid,
        name: form.username,
        email: form.email,
        password: form.password,
        role: form.role, // "reportero" o "editor"
        createdAt: serverTimestamp(),
      });

      console.log("Usuario registrado correctamente con rol:", form.role);
      navigate("/");
      
    } catch (error) {
      console.error("Error al registrar:", error);
      setError("Error al registrar usuario: " + error.message);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        {/* Logo */}
        <div className="register-logo">
          <svg viewBox="0 0 120 120" width="86" height="86" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0" stopColor="#ffd700" />
                <stop offset="1" stopColor="#ffb000" />
              </linearGradient>
            </defs>
            <rect rx="20" width="120" height="120" fill="#0a0a0a" />
            <g transform="translate(18,24)">
              <rect width="84" height="56" rx="6" fill="url(#g1)" opacity="0.95" />
              <rect x="6" y="6" width="72" height="12" rx="2" fill="#0a0a0a" />
              <rect x="6" y="26" width="72" height="6" rx="2" fill="#0a0a0a" />
            </g>
          </svg>
          <h1>Crear cuenta</h1>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          {error && <div className="register-error">{error}</div>}

          <label className="field">
            <span>Nombre de usuario</span>
            <input
              type="text"
              name="username"
              placeholder="Ej: jeank_dev"
              value={form.username}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field">
            <span>Correo electrónico</span>
            <input
              type="email"
              name="email"
              placeholder="correo@ejemplo.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field">
            <span>Contraseña</span>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field">
            <span>Confirmar contraseña</span>
            <input
              type="password"
              name="confirm"
              placeholder="••••••••"
              value={form.confirm}
              onChange={handleChange}
              required
            />
          </label>

          {/* Selección de rol */}
          <div className="field role-selector">
            <span>Selecciona tu rol:</span>
            <label>
              <input
                type="radio"
                name="role"
                value="reportero"
                checked={form.role === "reportero"}
                onChange={handleChange}
              />
              Reportero
            </label>
            <label>
              <input
                type="radio"
                name="role"
                value="editor"
                checked={form.role === "editor"}
                onChange={handleChange}
              />
              Editor
            </label>
          </div>

          <button type="submit" className="btn submit">
            Registrarme
          </button>

          <div className="divider"></div>

          <p className="login-cta">
            ¿Ya tienes una cuenta?{" "}
            <Link to="/login" className="link-login">
              Inicia sesión aquí
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
