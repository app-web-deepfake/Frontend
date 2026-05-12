import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { verifyEmailToken } from '../services/api.js';
import { IconCheck, IconClose } from '../components/Icons.jsx';
import '../styles/login.css';

export default function VerifyEmail() {
    const { token } = useParams();
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        verifyEmailToken(token)
            .then(() => setStatus('success'))
            .catch((err) => {
                setMessage(err.message);
                setStatus('error');
            });
    }, [token]);

    return (
        <div className="login-bg">
            <div className="login-container" style={{ textAlign: 'center' }}>
                {status === 'loading' && (
                    <div className="auth-status-box">
                        <div className="auth-loader" />
                        <h2 className="auth-status-title">Verificando tu cuenta...</h2>
                        <p className="auth-status-text">Por favor espera un momento.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="auth-status-box">
                        <div className="auth-status-icon success">
                            <IconCheck size={34} color="#4ade80" />
                        </div>
                        <h2 className="auth-status-title">¡Email verificado!</h2>
                        <p className="auth-status-text">
                            Tu cuenta ha sido confirmada correctamente. Ya puedes usar todas las funciones de la app.
                        </p>
                        <Link
                            to="/"
                            className="login-btn-main"
                            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', maxWidth: '373px', width: '100%' }}
                        >
                            Ir al inicio
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="auth-status-box">
                        <div className="auth-status-icon error">
                            <IconClose size={34} color="#f87171" />
                        </div>
                        <h2 className="auth-status-title error">Enlace inválido</h2>
                        <p className="auth-status-text">
                            {message || 'El enlace expiró o ya fue usado. Puedes solicitar uno nuevo iniciando sesión y revisando tu correo.'}
                        </p>
                        <Link
                            to="/"
                            className="login-btn-main"
                            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', maxWidth: '373px', width: '100%' }}
                        >
                            Volver al inicio
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
