import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext.jsx';
import { IconMenu, IconClose, IconUser, IconLogout, IconHome, IconHistory, IconShield, IconTextSize } from './Icons.jsx';
import StreakBadge from './StreakBadge.jsx';
import '../styles/Navbar.css';

// Icono simple para panel admin
const IconGrid = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
);

export default function Navbar() {
    const [menuOpen, setMenuOpen]       = useState(false);
    const [letraGrande, setLetraGrande] = useState(() => localStorage.getItem('letraGrande') === 'true');
    const location  = useLocation();
    const navigate  = useNavigate();
    const { user, logout } = useAuth();

    const toggleMenu = () => setMenuOpen(o => !o);
    const closeMenu  = () => setMenuOpen(false);
    const isActive   = (path) => location.pathname === path ? 'active' : '';

    const handleLogout = () => { logout(); navigate('/'); };

    const toggleLetraGrande = () => {
        const next = !letraGrande;
        setLetraGrande(next);
        localStorage.setItem('letraGrande', String(next));
        document.documentElement.classList.toggle('letra-grande', next);
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
                {user?.role === 'admin' ? (
                    <Link to="/admin" className={`navbar-link ${isActive('/admin')}`} onClick={closeMenu}>
                        <IconGrid /> Panel de administración
                    </Link>
                ) : (
                    <>
                        <Link to="/home" className={`navbar-link ${isActive('/home')}`} onClick={closeMenu}>
                            <IconHome size={16} color="white" /> Inicio
                        </Link>
                        <Link to="/historial" className={`navbar-link ${isActive('/historial')}`} onClick={closeMenu}>
                            <IconHistory size={16} color="white" /> Historial
                        </Link>
                        <Link to="/recomendaciones" className={`navbar-link ${isActive('/recomendaciones')}`} onClick={closeMenu}>
                            <IconShield size={16} color="white" /> Recomendaciones
                        </Link>
                    </>
                )}
            </div>

            <div className="navbar-user">
                <button
                    className="navbar-accesibilidad-btn"
                    onClick={toggleLetraGrande}
                    title={letraGrande ? 'Reducir texto' : 'Aumentar texto'}
                >
                    <IconTextSize size={14} color="white" />
                    {letraGrande ? 'A-' : 'A+'}
                </button>
                {user && user.role !== 'admin' && <StreakBadge compact />}
                {user && (
                    <Link to="/profile" className={`navbar-profile-btn ${isActive('/profile')}`} title="Mi perfil">
                        <IconUser size={14} color="white" />
                        {user.name?.split(' ')[0] || user.email}
                    </Link>
                )}
                <button className="navbar-logout-btn" onClick={handleLogout}>
                    <IconLogout size={14} color="white" />
                    Cerrar sesión
                </button>
            </div>
        </nav>
    );
}
