import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import "./Footer.css";

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">

                <div className="footer-about">
                    <h2>📰 NewsPortal</h2>
                    <p>
                        Tu fuente confiable de noticias actualizadas sobre tecnología,
                        deportes, cultura y más.
                    </p>
                </div>

                <div className="footer-links">
                    <h3>Enlaces rápidos</h3>
                    <ul>
                        <li><Link to="/">Inicio</Link></li>
                        <li><Link to="/category/tecnologia">Tecnología</Link></li>
                        <li><Link to="/category/deportes">Deportes</Link></li>
                        <li><Link to="/category/cultura">Cultura</Link></li>
                    </ul>
                </div>

                <div className="footer-social">
                    <h3>Síguenos</h3>
                    <div className="social-icons">
                        <a href="https://facebook.com" target="_blank" rel="noreferrer">
                            <FaFacebook />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noreferrer">
                            <FaInstagram />
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noreferrer">
                            <FaTwitter />
                        </a>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>© {new Date().getFullYear()} NewsPortal. Todos los derechos reservados.</p>
            </div>
        </footer>
    );
};

export default Footer;
