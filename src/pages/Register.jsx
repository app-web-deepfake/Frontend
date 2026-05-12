import { useState, useEffect } from 'react';
import '../styles/Register.css';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/authContext.jsx';
import { authRegister } from '../services/api.js';

const Register = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated, loading: authLoading } = useAuth();
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [registered, setRegistered] = useState(false);

    if (!authLoading && isAuthenticated) return <Navigate to="/home" replace />;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!formData.name || !formData.email || !formData.password) {
            setError('Completa todos los campos');
            return;
        }
        if (formData.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }
        setSubmitting(true);
        try {
            const data = await authRegister(formData);
            login(data.user, data.token);
            setRegistered(true);
            setTimeout(() => navigate('/home'), 3000);
        } catch (err) {
            setError(err.message || 'Error al crear cuenta');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="register-page">
            <div className="register-container">
                <h1>Crear una cuenta</h1>
                {registered ? (
                    <div style={{ textAlign: 'center', padding: '16px 0' }}>
                        <p style={{ color: '#22c55e', fontSize: '15px', marginBottom: '8px' }}>
                            ✅ ¡Cuenta creada! Revisa tu correo para verificar tu cuenta.
                        </p>
                        <p style={{ color: '#64748b', fontSize: '13px' }}>Redirigiendo en unos segundos...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            name="name"
                            placeholder="Nombre"
                            value={formData.name}
                            onChange={handleInputChange}
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleInputChange}
                        />
                        <input
                            type="password"
                            name="password"
                            placeholder="Contraseña (mín. 6 caracteres)"
                            value={formData.password}
                            onChange={handleInputChange}
                        />

                        {error && (
                            <div style={{ color: '#e74c3c', fontSize: '13px', textAlign: 'center', marginTop: '-4px' }}>
                                {error}
                            </div>
                        )}

                        <button type="submit" className="create-account-btn" disabled={submitting}>
                            {submitting ? 'Creando cuenta...' : 'Crear cuenta'}
                        </button>
                        <button type="button" className="facebook-btn">
                            <i className="fab fa-facebook-f"></i> Regístrate con Facebook
                        </button>
                    </form>
                )}
                <p className="login-link">
                    ¿Ya tienes cuenta? <Link to="/">Inicia Sesión aquí</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;