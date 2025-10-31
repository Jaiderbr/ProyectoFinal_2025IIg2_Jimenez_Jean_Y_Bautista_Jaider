import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../client";
import "./Header.css";
import SectionCard from "../SectionCard/SectionCard.jsx";

const Header = ({ onSectionClick }) => {
    const [sections, setSections] = useState([]);

    useEffect(() => {
        const fetchSections = async () => {
            try {
                const { data, error } = await supabase
                    .from('secciones')
                    .select('*');
                if (error) throw error;
                setSections(data || []);
            } catch (error) {
                console.error("Error al obtener secciones:", error);
            }
        };

        fetchSections();
    }, []);

    return (
        <>
            <header className="header">
                <div className="header-container">
                    <div className="logo">
                        <Link to="/">
                            <span className="logo-icon">📰</span>
                            <span className="logo-text">
                                <span className="logo-news">NEWS</span>
                                <span className="logo-portal">PORTAL</span>
                            </span>
                        </Link>
                    </div>
                    <div className="auth-buttons">
                        <Link to="/login" className="btn login-btn">
                            Iniciar Sesión
                        </Link>
                    </div>
                </div>
            </header>

            <div className="sections-container">
                <div className="left-panel">
                    <h2>📑 View Sections</h2>
                    <p>Administra las secciones del portal de noticias.</p>
                </div>

                <div className="right-panel">
                    <div className="sections-grid">
                        {sections.length > 0 ? (
                            sections.map((sec) => (
                                <SectionCard
                                    key={sec.idseccion}
                                    nombre={sec.nombre}
                                    descripcion={sec.descripcion}
                                    estado={sec.estado}
                                    onClick={() => onSectionClick && onSectionClick(sec.nombre)}
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
