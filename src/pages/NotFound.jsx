import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext.jsx';
import '../styles/NotFound.css';

export default function NotFound() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    return (
        <div className="notfound-page">
            <div className="notfound-card">
                <div className="notfound-code">404</div>
                <h1 className="notfound-title">Pagina no encontrada</h1>
                <p className="notfound-text">
                    La pagina que buscas no existe o fue movida.
                </p>
                <button
                    className="notfound-btn"
                    onClick={() => navigate(isAuthenticated ? '/home' : '/')}
                >
                    Volver al inicio
                </button>
            </div>
        </div>
    );
}