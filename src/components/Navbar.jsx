import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext.jsx';
import '../styles/Navbar.css';

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const toggleMenu = () => setMenuOpen(!menuOpen);
    const closeMenu = () => setMenuOpen(false);
    const isActive = (path) => location.pathname === path ? 'active' : '';

    const handleLogout = () => {
        logout();
        navigate('/');
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
                <Link to="/home" className={`navbar-link ${isActive('/home')}`} onClick={closeMenu}>
                    Inicio
                </Link>
                <Link to="/historial" className={`navbar-link ${isActive('/historial')}`} onClick={closeMenu}>
                    Historial
                </Link>
                <Link to="/recomendaciones" className={`navbar-link ${isActive('/recomendaciones')}`} onClick={closeMenu}>
                    Recomendaciones
                </Link>
            </div>

            {/* Usuario + logout */}
            <div className="navbar-user">
                {user && (
                    <span className="navbar-username">
                        👤 {user.name || user.email}
                    </span>
                )}
                <button className="navbar-logout-btn" onClick={handleLogout}>
                    Cerrar sesión
                </button>
            </div>
        </nav>
    );
}