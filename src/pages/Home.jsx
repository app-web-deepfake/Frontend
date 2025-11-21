import React, { useState } from 'react';
import '../styles/Home.css';
import Upload from "../components/Upload.jsx";
import {useNavigate} from "react-router-dom";
import Navbar from "../components/Navbar.jsx";


const Home = () => {
    const [showUpload, setShowUpload] = useState(false);
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleUploadComplete = ({ fileId, analysis }) => {
        navigate('/result', { state: { fileId, analysis } });
    };

    return (
        <div className="home-container">
            {/* Header/Navigation */}
            <Navbar />

            {/* Hero Section */}
            <section className="hero-section">
                <h1 className="hero-title">¿No sabes si es real?<br/>Veámos</h1>
                <p className="hero-subtitle">
                    Algunos videos o imágenes pueden ser manipulados, <span className="text-warning">ten cuidado</span>.
                </p>

                <button
                    className="upload-button"
                    onClick={() => setShowUpload(true)}
                >
                    <span className="upload-icon">↑</span>
                    Sube una imagen o video
                </button>
            </section>

            {/* Instructions Section */}
            <section className="instructions-section">
                <h2 className="section-title">¿Cómo subir un video?</h2>

                <div className="steps">
                    <div className="step">
                        <div className="step-number">1</div>
                        <p className="step-text">Dale click al botón naranja</p>
                    </div>

                    <div className="step">
                        <div className="step-number">2</div>
                        <p className="step-text">Elige el video que deseas analizar</p>
                    </div>

                    <div className="step">
                        <div className="step-number">3</div>
                        <p className="step-text">Espera los resultados</p>
                    </div>
                </div>
            </section>

            {/* Tutorial Section */}
            <section className="tutorial-section">
                <h2 className="section-title">Aquí te ayudamos a conseguir un video</h2>
                <p className="section-subtitle">Sigue los pasos del tutorial para grabar tu pantalla</p>

                <div className="tutorial-card">
                    <img
                        src="https://via.placeholder.com/400x300/E8F0FE/4285F4?text=Video+Tutorial"
                        alt="Tutorial de video"
                        className="tutorial-image"
                    />
                </div>
            </section>

            {/* Contact Section */}
            <section className="contact-section">
                <h2 className="section-title">¿Aún tienes dudas?</h2>
                <p className="section-subtitle">Contacta con un administrador llenando el formulario</p>

                <div className="contact-card">
                    <div className="contact-form">
                        <input
                            type="email"
                            placeholder="Email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <textarea
                            placeholder="Explícanos el problema"
                            className="form-textarea"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows="4"
                        />
                        <button className="submit-button">Enviar</button>
                    </div>
                </div>
            </section>
            {showUpload && <Upload onClose={() => setShowUpload(false)} />}

            {/* Modal Upload */}
            {showUpload && (
                <Upload
                    onClose={() => setShowUpload(false)}
                />
            )}
        </div>
    );
};
export default Home;
