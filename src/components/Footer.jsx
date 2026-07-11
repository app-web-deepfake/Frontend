import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="app-footer">
            <div className="footer-inner">
                {/* Marca */}
                <div className="footer-brand">
                    <span className="footer-logo">☯</span>
                    <span className="footer-brand-name">YingYangAI</span>
                </div>

                <p className="footer-tagline">
                    Detecta lo real. Cuestiona lo artificial.
                </p>

                {/* Links */}
                <nav className="footer-links">
                    <Link to="/home" className="footer-link">Inicio</Link>
                    <Link to="/historial" className="footer-link">Historial</Link>
                    <Link to="/recomendaciones" className="footer-link">Recomendaciones</Link>
                    <Link to="/profile" className="footer-link">Mi perfil</Link>
                </nav>

                <div className="footer-bottom">
                    <p className="footer-copy">© {year} YingYangAI. Todos los derechos reservados.</p>
                    <p className="footer-disclaimer">
                        Este servicio es orientativo. Los resultados no reemplazan el criterio humano.
                    </p>
                </div>
            </div>
        </footer>
    );
}
