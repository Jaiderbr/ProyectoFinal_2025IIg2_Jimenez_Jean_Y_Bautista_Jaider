import React from "react";
import "./SectionCard.css";

const SectionCard = ({ nombre, descripcion, estado, onClick }) => {
    const isActive = estado !== false;
    return (
        <div
            className={`section-card ${isActive ? "active" : "inactive"}`}
            onClick={onClick}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
        >
            <div
                className={`left-border ${isActive ? "left-active" : "left-inactive"}`}
            ></div>
            <div className="card-content">
                <div className="card-header">
                    <span className="icon">📰</span>
                    <h3 className="section-title">{nombre}</h3>
                </div>
                <p className="description">{descripcion || "Sin descripción"}</p>
            </div>
        </div>
    );
};

export default SectionCard;
