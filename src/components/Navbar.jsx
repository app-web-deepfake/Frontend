import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Navbar.css';

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const closeMenu = () => {
        setMenuOpen(false);
    };

    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    return (
        <nav className="navbar">
            {/* Menú hamburguesa (solo móvil) */}
            <button
                className="navbar-menu-btn"
                onClick={toggleMenu}
                aria-label="Menú de navegación"
            >
                {menuOpen ? '✕' : '☰'}
            </button>

            {/* Links de navegación */}
            <div className={`navbar-nav ${menuOpen ? 'open' : ''}`}>
                <Link
                    to="/home"
                    className={`navbar-link ${isActive('/home')}`}
                    onClick={closeMenu}
                >
                    Inicio
                </Link>
                <Link
                    to="/historial"
                    className={`navbar-link ${isActive('/historial')}`}
                    onClick={closeMenu}
                >
                    Historial
                </Link>
                <Link
                    to="/recomendaciones"
                    className={`navbar-link ${isActive('/recomendaciones')}`}
                    onClick={closeMenu}
                >
                    Recomendaciones
                </Link>
            </div>
        </nav>
    );
}
