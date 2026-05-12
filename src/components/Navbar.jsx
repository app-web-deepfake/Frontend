import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext.jsx';
import { IconMenu, IconClose, IconUser, IconLogout, IconHome, IconHistory, IconShield, IconTextSize } from './Icons.jsx';
import '../styles/Navbar.css';

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [letraGrande, setLetraGrande] = useState(() => localStorage.getItem('letraGrande') === 'true');
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

    const toggleLetraGrande = () => {
        const nuevo = !letraGrande;
        setLetraGrande(nuevo);
        localStorage.setItem('letraGrande', String(nuevo));
        document.documentElement.classList.toggle('letra-grande', nuevo);
    };

    useEffect(() => {
        document.documentElement.classList.toggle('letra-grande', letraGrande);
    }, []);

    return (
        <nav className="navbar">
            <button className="navbar-menu-btn" onClick={toggleMenu} aria-label="Menu">
                {menuOpen ? <IconClose size={22} color="white" /> : <IconMenu size={22} color="white" />}
            </button>

            <div className={`navbar-nav ${menuOpen ? 'open' : ''}`}>
                <Link to="/home" className={`navbar-link ${isActive('/home')}`} onClick={closeMenu}>
                    <IconHome size={17} color="white" />
                    Inicio
                </Link>
                <Link to="/historial" className={`navbar-link ${isActive('/historial')}`} onClick={closeMenu}>
                    <IconHistory size={17} color="white" />
                    Historial
                </Link>
                <Link to="/recomendaciones" className={`navbar-link ${isActive('/recomendaciones')}`} onClick={closeMenu}>
                    <IconShield size={17} color="white" />
                    Recomendaciones
                </Link>
            </div>

            <div className="navbar-user">
                <button
                    className="navbar-accesibilidad-btn"
                    onClick={toggleLetraGrande}
                    title={letraGrande ? 'Reducir texto' : 'Aumentar texto para mayor comodidad'}
                >
                    <IconTextSize size={15} color="white" />
                    {letraGrande ? 'A-' : 'A+'}
                </button>
                {user && (
                    <Link
                        to="/profile"
                        className={`navbar-profile-btn ${isActive('/profile')}`}
                        title="Ver mi perfil"
                    >
                        <IconUser size={15} color="white" />
                        {user.name || user.email}
                    </Link>
                )}
                <button className="navbar-logout-btn" onClick={handleLogout}>
                    <IconLogout size={15} color="white" />
                    Cerrar sesion
                </button>
            </div>
        </nav>
    );
}
