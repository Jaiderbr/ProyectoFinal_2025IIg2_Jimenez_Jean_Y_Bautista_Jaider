import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../Firebase/config";
import "./Header.css";
import SectionCard from "../SectionCard/SectionCard.jsx";

const Header = () => {
  // Estado que guarda las secciones obtenidas desde Firebase
  const [sections, setSections] = useState([]);

  // useEffect para cargar las secciones al montar el componente
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Secciones"));
        const fetchedSections = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSections(fetchedSections);
      } catch (error) {
        console.error("Error al obtener secciones:", error);
      }
    };

    fetchSections();
  }, []);

  return (
    <>
      {/* Header principal */}
      <header className="header">
        <div className="header-container">
          {/* Logo / Nombre del portal */}
          <div className="logo">
            <Link to="/">📰 NewsPortal</Link>
          </div>

          {/* Botones de sesión */}
          <div className="auth-buttons">
            <Link to="/login" className="btn login-btn">
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </header>

      {/* Contenedor principal */}
      <div className="sections-container">
        {/* Panel izquierdo */}
        <div className="left-panel">
          <h2>📑 View Sections</h2>
          <p>Administra las secciones del portal de noticias.</p>
          <img
            src="/assets/mail-illustration.png"
            alt="Ilustración"
            className="illustration"
          />
        </div>

        {/* Panel derecho */}
        <div className="right-panel">
          <div className="sections-grid">
            {sections.length > 0 ? (
              sections.map((sec) => (
                <SectionCard
                  key={sec.id}
                  nombre={sec.nombre}
                  descripcion={sec.descripcion}
                  estado={sec.estado}
                />
              ))
            ) : (
              <p className="no-data">No hay secciones registradas.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
