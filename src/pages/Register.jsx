import { useState, useEffect } from 'react';
import '../styles/Register.css';

const Register = () => {
  useEffect(() => {
    const montserratFont = document.createElement("link");
    montserratFont.rel = "stylesheet";
    montserratFont.href =
      "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap";
    document.head.appendChild(montserratFont);

    // Cleanup function to remove the link when component unmounts
    return () => {
      document.head.removeChild(montserratFont);
    };
  }, []);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you can add the logic to save the user data
    console.log('Form submitted:', formData);
  };

  const handleFacebookLogin = () => {
    // Add Facebook login logic here
    console.log('Facebook login clicked');
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
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleInputChange}
          />
          <button type="submit" className="create-account-btn">
            Crear cuenta
          </button>
          <button type="button" className="facebook-btn" onClick={handleFacebookLogin}>
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