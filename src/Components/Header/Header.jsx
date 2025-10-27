import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import "./Header.css";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo / Nombre del portal */}
        <div className="logo">
          <Link to="/">📰 NewsPortal</Link>
        </div>

        {/* Botón hamburguesa (solo en móvil) */}
        <div className="menu-toggle" onClick={toggleMenu}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>

        {/* Navegación principal */}
        <nav className={`nav ${menuOpen ? "open" : ""}`}>
          <ul>
            <li>
              <NavLink to="/" onClick={() => setMenuOpen(false)}>Inicio</NavLink>
            </li>
            <li>
              <NavLink to="/category/tecnologia" onClick={() => setMenuOpen(false)}>Tecnología</NavLink>
            </li>
            <li>
              <NavLink to="/category/deportes" onClick={() => setMenuOpen(false)}>Deportes</NavLink>
            </li>
            <li>
              <NavLink to="/category/cultura" onClick={() => setMenuOpen(false)}>Cultura</NavLink>
            </li>
          </ul>
        </nav>

        {/* Botones de sesión */}
        <div className="auth-buttons">
          <Link to="/login" className="btn login-btn">Iniciar Sesión</Link>          
        </div>
      </div>
    </header>
  );
};

export default Header;
