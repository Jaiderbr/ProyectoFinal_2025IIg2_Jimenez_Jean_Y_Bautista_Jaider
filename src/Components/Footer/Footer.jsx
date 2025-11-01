import React from "react";
import { Box, Typography, Link } from "@mui/material";
import { Email, GitHub } from "@mui/icons-material";
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

                <Box className="footer-section">
                    <Typography variant="h6" className="footer-title simpsons-text">
                        Authors
                    </Typography>
                    <Box className="authors-grid">
                        <Box className="author-card">
                            <Typography variant="body1" className="author-name simpsons-text">
                                Jaider Bautista Rodriguez
                            </Typography>
                            <Box className="author-links">
                                <Link href="mailto:jaid.bautista@udla.edu.co" className="author-link">
                                    <Email sx={{ fontSize: 16, mr: 0.5 }} />
                                    Contact
                                </Link>
                                <Link href="https://github.com/Jaiderbr" target="_blank" rel="noreferrer" className="author-link">
                                    <GitHub sx={{ fontSize: 16, mr: 0.5 }} />
                                    GitHub
                                </Link>
                            </Box>
                        </Box>
                        <Box className="author-card">
                            <Typography variant="body1" className="author-name simpsons-text">
                                Jean Carlos Jimenez Ortega
                            </Typography>
                            <Box className="author-links">
                                <Link href="mailto:jean.jimenez@udla.edu.co" className="author-link">
                                    <Email sx={{ fontSize: 16, mr: 0.5 }} />
                                    Contact
                                </Link>
                                <Link href="https://github.com/Jeank-J" target="_blank" rel="noreferrer" className="author-link">
                                    <GitHub sx={{ fontSize: 16, mr: 0.5 }} />
                                    GitHub
                                </Link>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </div>

            <div className="footer-bottom">
                <p>© {new Date().getFullYear()} NewsPortal. Todos los derechos reservados.</p>
            </div>
        </footer>
    );
};

export default Footer;
