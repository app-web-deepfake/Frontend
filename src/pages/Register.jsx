import { useState, useEffect } from 'react';
import '../styles/Register.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext.jsx';
import { authRegister } from '../services/api.js';

const Register = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap";
        document.head.appendChild(link);
        return () => document.head.removeChild(link);
    }, []);

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
        setLoading(true);
        try {
            const data = await authRegister(formData);
            login(data.user, data.token);
            navigate('/home');
        } catch (err) {
            setError(err.message || 'Error al crear cuenta');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">
            <div className="register-container">
                <h1>Crear una cuenta</h1>
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

                    <button type="submit" className="create-account-btn" disabled={loading}>
                        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                    </button>
                    <button type="button" className="facebook-btn">
                        <i className="fab fa-facebook-f"></i> Regístrate con Facebook
                    </button>
                </form>
                <p className="login-link">
                    ¿Ya tienes cuenta? <a href="./">Inicia Sesión aquí</a>
                </p>
            </div>
        </div>
    );
};

export default Register;