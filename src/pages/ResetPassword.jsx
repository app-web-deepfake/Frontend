import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../services/api.js';
import { IconShield, IconCheck } from '../components/Icons.jsx';
import '../styles/login.css';

const EyeIcon = ({ open }) => open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
    </svg>
);

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirm) return setError('Las contraseñas no coinciden');
        if (password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres');
        setLoading(true);
        setError('');
        try {
            await resetPassword(token, password);
            setSuccess(true);
            setTimeout(() => navigate('/'), 3000);
        } catch (err) {
            setError(err.message || 'Token inválido o expirado');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-bg">
            <div className="login-container">
                {success ? (
                    <div className="auth-status-box">
                        <div className="auth-status-icon success">
                            <IconCheck size={36} color="#4ade80" />
                        </div>
                        <h2 className="auth-status-title">¡Contraseña actualizada!</h2>
                        <p className="auth-status-text">
                            Tu contraseña ha sido cambiada correctamente. Redirigiendo al inicio...
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="auth-icon-header">
                            <IconShield size={34} color="#F6A120" />
                        </div>
                        <h1 className="login-title" style={{ fontSize: '26px', marginBottom: '6px' }}>
                            Nueva contraseña
                        </h1>
                        <p className="auth-subtitle">
                            Elige una contraseña segura de al menos 6 caracteres.
                        </p>

                        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <label htmlFor="rp-pass" className="auth-label">Nueva contraseña</label>
                            <div className="pass-field-wrapper">
                                <input
                                    id="rp-pass"
                                    type={showPass ? 'text' : 'password'}
                                    className="login-input"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Mínimo 6 caracteres"
                                    autoComplete="new-password"
                                    required
                                />
                                <button type="button" className="pass-toggle-btn" onClick={() => setShowPass(v => !v)}
                                    aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                                    <EyeIcon open={showPass} />
                                </button>
                            </div>

                            <label htmlFor="rp-confirm" className="auth-label">Confirmar contraseña</label>
                            <div className="pass-field-wrapper">
                                <input
                                    id="rp-confirm"
                                    type={showConfirm ? 'text' : 'password'}
                                    className="login-input"
                                    value={confirm}
                                    onChange={e => setConfirm(e.target.value)}
                                    placeholder="Repite tu contraseña"
                                    autoComplete="new-password"
                                    required
                                />
                                <button type="button" className="pass-toggle-btn" onClick={() => setShowConfirm(v => !v)}
                                    aria-label={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                                    <EyeIcon open={showConfirm} />
                                </button>
                            </div>

                            {error && <div className="auth-error" role="alert">{error}</div>}

                            <button type="submit" className="login-btn-main" disabled={loading}>
                                {loading
                                    ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><span className="auth-spinner" />Guardando...</span>
                                    : 'Guardar nueva contraseña'}
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
