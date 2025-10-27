import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
    
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validación mínima
    if (!username.trim() || !password) {
      setError("Por favor ingresa usuario y contraseña.");
      return;
    }

    try {
      // TODO: Conectar aquí con Firebase Auth o Supabase
      // Ejemplo pseudo:
      // await auth.signInWithEmailAndPassword(username, password);

      // Simulación rápida (quitar en integración real)
      console.log("Login attempt:", { username, password });

      // Redirigir a dashboard o main
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Credenciales inválidas o error de conexión.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card" role="main" aria-labelledby="login-title">
        
        <div className="login-logo" aria-hidden="false">
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
          <h1 id="login-title">NewsPortal</h1>
        </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {error && <div className="login-error" role="alert">{error}</div>}

          <label className="field">
            <span className="label-text">Usuario o correo</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="tu.usuario o correo@ejemplo.com"
              autoComplete="username"
              required
            />
          </label>

          <label className="field">
            <span className="label-text">Contraseña</span>
            <div className="password-wrapper">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="show-toggle"
                aria-pressed={showPass}
                onClick={() => setShowPass((s) => !s)}
                title={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPass ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </label>

          <div className="extras">
            <label className="remember">
              <input type="checkbox" /> Recuérdame
            </label>
            <Link to="/forgot" className="forgot">¿Olvidaste tu contraseña?</Link>
          </div>

          <button className="btn submit" type="submit">Iniciar sesión</button>

          <div className="divider" />

          <p className="signup-cta">
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="link-register">Regístrate aquí</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
