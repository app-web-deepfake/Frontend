import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/api.js';
import { IconShield } from '../components/Icons.jsx';
import '../styles/login.css';

// Inline SVG: envelope with check
const IconMail = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
        stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
    </svg>
);

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await forgotPassword(email);
            setSent(true);
        } catch (err) {
            setError(err.message || 'Error procesando solicitud');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-bg">
            <div className="login-container">
                {sent ? (
                    <div className="auth-status-box">
                        <div className="auth-status-icon success">
                            <IconMail />
                        </div>
                        <h2 className="auth-status-title">¡Revisa tu correo!</h2>
                        <p className="auth-status-text">
                            Si el email está registrado, recibirás un enlace de restablecimiento en breve. Revisa también tu carpeta de spam.
                        </p>
                        <Link
                            to="/"
                            className="login-btn-main"
                            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', maxWidth: '373px', width: '100%' }}
                        >
                            Volver al inicio
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="auth-icon-header">
                            <IconShield size={34} color="#F6A120" />
                        </div>
                        <h1 className="login-title" style={{ fontSize: '26px', marginBottom: '6px' }}>
                            ¿Olvidaste tu contraseña?
                        </h1>
                        <p className="auth-subtitle">
                            Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
                        </p>

                        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <label htmlFor="fp-email" className="auth-label">Email</label>
                            <input
                                id="fp-email"
                                type="email"
                                className="login-input"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="tu@email.com"
                                autoComplete="email"
                                required
                            />

                            {error && <div className="auth-error" role="alert">{error}</div>}

                            <button type="submit" className="login-btn-main" disabled={loading}>
                                {loading
                                    ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><span className="auth-spinner" />Enviando...</span>
                                    : 'Enviar enlace'}
                            </button>
                        </form>

                        <div className="login-register" style={{ marginTop: '20px' }}>
                            <Link to="/">← Volver al inicio</Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
