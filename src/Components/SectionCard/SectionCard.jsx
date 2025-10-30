import React from "react";
import "./SectionCard.css";

const SectionCard = ({ nombre, descripcion, estado }) => {
  return (
    <div className={`section-card ${estado ? "active" : "inactive"}`}>
      {/* Barra lateral */}
      <div
        className={`left-border ${estado ? "left-active" : "left-inactive"}`}
      ></div>

      {/* Contenido del card */}
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
