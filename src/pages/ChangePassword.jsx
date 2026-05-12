import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { changePassword } from '../services/api.js';
import { IconShield, IconCheck } from '../components/Icons.jsx';
import '../styles/ChangePassword.css';

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

const fields = [
    { name: 'currentPassword', label: 'Contraseña actual', placeholder: 'Tu contraseña actual', autoComplete: 'current-password' },
    { name: 'newPassword',     label: 'Nueva contraseña',  placeholder: 'Mínimo 6 caracteres',    autoComplete: 'new-password' },
    { name: 'confirm',         label: 'Confirmar contraseña', placeholder: 'Repite la nueva contraseña', autoComplete: 'new-password' },
];

export default function ChangePassword() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
    const [show, setShow] = useState({ currentPassword: false, newPassword: false, confirm: false });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const toggleShow = (name) => setShow(prev => ({ ...prev, [name]: !prev[name] }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.newPassword !== form.confirm) return setError('Las contraseñas nuevas no coinciden');
        if (form.newPassword.length < 6) return setError('La nueva contraseña debe tener al menos 6 caracteres');
        setLoading(true);
        setError('');
        try {
            await changePassword(form.currentPassword, form.newPassword);
            setSuccess(true);
            setTimeout(() => navigate('/home'), 2500);
        } catch (err) {
            setError(err.message || 'Error al cambiar contraseña');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="change-pass-page">
            <Navbar />
            <div className="change-pass-main">
                <div className="change-pass-card">
                    {success ? (
                        <div className="cp-success">
                            <div className="cp-success-icon">
                                <IconCheck size={30} color="#16a34a" />
                            </div>
                            <h3 className="cp-success-title">¡Contraseña actualizada!</h3>
                            <p className="cp-success-text">Tu contraseña fue cambiada correctamente. Redirigiendo...</p>
                        </div>
                    ) : (
                        <>
                            <div className="change-pass-header">
                                <div className="change-pass-icon">
                                    <IconShield size={22} color="#407FC2" />
                                </div>
                                <h2 className="change-pass-title">Cambiar contraseña</h2>
                            </div>
                            <p className="change-pass-subtitle">Actualiza tu contraseña de acceso.</p>

                            {error && <div className="cp-error" role="alert">{error}</div>}

                            <form onSubmit={handleSubmit}>
                                {fields.map(({ name, label, placeholder, autoComplete }) => (
                                    <div className="cp-field" key={name}>
                                        <label className="cp-label" htmlFor={`cp-${name}`}>{label}</label>
                                        <div className="cp-pass-wrapper">
                                            <input
                                                id={`cp-${name}`}
                                                type={show[name] ? 'text' : 'password'}
                                                name={name}
                                                className="cp-input"
                                                value={form[name]}
                                                onChange={handleChange}
                                                placeholder={placeholder}
                                                autoComplete={autoComplete}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="cp-toggle"
                                                onClick={() => toggleShow(name)}
                                                aria-label={show[name] ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                            >
                                                <EyeIcon open={show[name]} />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <button type="submit" className="cp-btn" disabled={loading}>
                                    {loading ? <><span className="cp-spinner" />Guardando...</> : 'Cambiar contraseña'}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
