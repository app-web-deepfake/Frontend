import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { useAuth } from '../context/authContext.jsx';
import { updateProfile, getMe, resendVerification } from '../services/api.js';
import { IconShield, IconCheck, IconAlert } from '../components/Icons.jsx';
import '../styles/Profile.css';

const getInitials = (name = '', email = '') => {
    if (name) {
        const parts = name.trim().split(' ');
        return parts.length >= 2
            ? (parts[0][0] + parts[1][0]).toUpperCase()
            : parts[0].slice(0, 2).toUpperCase();
    }
    return email.slice(0, 2).toUpperCase();
};

export default function Profile() {
    const { user, updateUser } = useAuth();
    const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [resendLoading, setResendLoading] = useState(false);
    const [resendMsg, setResendMsg] = useState('');
    const [emailVerified, setEmailVerified] = useState(user?.emailVerified);

    // Sync fresh data from backend on mount
    useEffect(() => {
        getMe().then(({ user: fresh }) => {
            setForm({ name: fresh.name || '', email: fresh.email || '' });
            setEmailVerified(fresh.emailVerified);
            updateUser({ name: fresh.name, email: fresh.email, emailVerified: fresh.emailVerified });
        }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
        setSuccess('');
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) return setError('El nombre no puede estar vacío');
        if (!form.email.trim()) return setError('El email no puede estar vacío');
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const { user: updated } = await updateProfile({ name: form.name.trim(), email: form.email.trim() });
            updateUser({ name: updated.name, email: updated.email, emailVerified: updated.emailVerified });
            setEmailVerified(updated.emailVerified);
            setSuccess(
                updated.emailVerified === false && updated.email !== user?.email
                    ? 'Perfil actualizado. Revisa tu nuevo correo para verificarlo.'
                    : 'Perfil actualizado correctamente.'
            );
        } catch (err) {
            setError(err.message || 'Error actualizando perfil');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResendLoading(true);
        setResendMsg('');
        try {
            await resendVerification();
            setResendMsg('Correo de verificación enviado. Revisa tu bandeja.');
        } catch (err) {
            setResendMsg(err.message || 'Error reenviando verificación');
        } finally {
            setResendLoading(false);
        }
    };

    const initials = getInitials(form.name, form.email);

    return (
        <div className="profile-page">
            <Navbar />
            <div className="profile-main">

                {/* Avatar card */}
                <div className="profile-avatar-card">
                    <div className="profile-avatar">{initials}</div>
                    <div className="profile-avatar-info">
                        <p className="profile-display-name">{form.name || '—'}</p>
                        <p className="profile-display-email">{form.email}</p>
                        <div className="profile-badges">
                            {emailVerified
                                ? <span className="profile-badge verified"><IconCheck size={11} color="#16a34a" /> Verificado</span>
                                : <span className="profile-badge unverified"><IconAlert size={11} color="#d97706" /> Sin verificar</span>
                            }
                            <span className="profile-badge role">{user?.role || 'usuario'}</span>
                        </div>
                    </div>
                </div>

                {/* Edit form */}
                <div className="profile-card">
                    <h3 className="profile-card-title">Información personal</h3>

                    {error && <div className="pf-error" role="alert">{error}</div>}
                    {success && (
                        <div className="pf-success" role="status">
                            <IconCheck size={14} color="#16a34a" />
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSave}>
                        <div className="pf-field">
                            <label className="pf-label" htmlFor="pf-name">Nombre</label>
                            <input
                                id="pf-name"
                                name="name"
                                type="text"
                                className="pf-input"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Tu nombre completo"
                                autoComplete="name"
                                required
                            />
                        </div>

                        <div className="pf-field">
                            <label className="pf-label" htmlFor="pf-email">Email</label>
                            <input
                                id="pf-email"
                                name="email"
                                type="email"
                                className="pf-input"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="tu@email.com"
                                autoComplete="email"
                                required
                            />
                            {form.email !== user?.email && (
                                <p className="pf-hint">⚠ Cambiar el email requerirá verificación nuevamente.</p>
                            )}
                        </div>

                        <button type="submit" className="pf-btn-save" disabled={loading}>
                            {loading
                                ? <><span className="pf-spinner" />Guardando...</>
                                : 'Guardar cambios'}
                        </button>
                    </form>
                </div>

                {/* Actions */}
                <div className="profile-actions-card">
                    <Link to="/change-password" className="pf-action-btn outlined">
                        <IconShield size={18} color="#407FC2" />
                        <span className="pf-action-label">Cambiar contraseña</span>
                        <span className="pf-action-arrow">›</span>
                    </Link>

                    {!emailVerified && (
                        <button
                            className={`pf-action-btn ghost${resendLoading ? ' disabled-look' : ''}`}
                            onClick={handleResend}
                            disabled={resendLoading}
                            type="button"
                        >
                            <IconAlert size={18} color="#d97706" />
                            <span className="pf-action-label">
                                {resendLoading ? 'Enviando...' : resendMsg || 'Reenviar correo de verificación'}
                            </span>
                        </button>
                    )}

                    {resendMsg && emailVerified === false && !resendLoading && (
                        <p style={{ fontSize: '0.8rem', color: '#16a34a', margin: '0 0 0 4px' }}>{resendMsg}</p>
                    )}
                </div>

            </div>
        </div>
    );
}
