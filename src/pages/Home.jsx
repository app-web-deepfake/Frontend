import React, { useState } from 'react';
import '../styles/Home.css';
import Upload from "../components/Upload.jsx";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../context/authContext.jsx";
import { IconUpload } from "../components/Icons.jsx";

const Home = () => {
    const [showUpload, setShowUpload] = useState(false);
    const { user } = useAuth();

    const [email, setEmail] = useState(user?.email || '');
    const [message, setMessage] = useState('');
    const [contactSent, setContactSent] = useState(false);
    const [contactError, setContactError] = useState('');

    const handleContactSubmit = () => {
        if (!email.trim() || !message.trim()) {
            setContactError('Por favor completa todos los campos antes de enviar.');
            return;
        }
        setContactError('');
        setContactSent(true);
        setMessage('');
    };

    return (
        <div className="home-container">
            <Navbar />

            {/* Hero */}
            <section className="hero-section">
                <h1 className="hero-title">
                    {user ? `Hola, ${user.name.split(' ')[0]}` : 'Detecta contenido falso en segundos'}
                </h1>
                <p className="hero-subtitle">
                    Sube una imagen o video y nuestro sistema te dira si fue modificado digitalmente.
                    <br />
                    <span className="text-warning">Algunos contenidos en internet no son lo que parecen.</span>
                </p>
                <button className="upload-button" onClick={() => setShowUpload(true)}>
                    <IconUpload size={20} color="white" />
                    Sube una imagen o video
                </button>
            </section>

            {/* Pasos */}
            <section className="instructions-section">
                <h2 className="section-title">Como funciona</h2>
                <div className="steps">
                    <div className="step">
                        <div className="step-number">1</div>
                        <div>
                            <p className="step-text">Haz clic en el boton naranja</p>
                            <p className="step-desc">Se abrira una ventana para elegir el archivo desde tu dispositivo.</p>
                        </div>
                    </div>
                    <div className="step">
                        <div className="step-number">2</div>
                        <div>
                            <p className="step-text">Elige la imagen o video que quieres verificar</p>
                            <p className="step-desc">Puedes subir fotos en formato JPG o PNG, y videos en MP4. El archivo no debe superar los 60 MB.</p>
                        </div>
                    </div>
                    <div className="step">
                        <div className="step-number">3</div>
                        <div>
                            <p className="step-text">Espera unos segundos y revisa el resultado</p>
                            <p className="step-desc">El sistema analizara el contenido y te explicara si es autentico o fue alterado digitalmente.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contacto */}
            <section className="contact-section">
                <h2 className="section-title">Tienes alguna duda?</h2>
                <p className="section-subtitle">Escribenos y te responderemos a la brevedad</p>

                <div className="contact-card">
                    {contactSent ? (
                        <div className="contact-sent">
                            <p>Tu mensaje fue enviado correctamente. Te responderemos pronto.</p>
                            <button
                                className="submit-button"
                                style={{ marginTop: '1.25rem' }}
                                onClick={() => setContactSent(false)}
                            >
                                Enviar otro mensaje
                            </button>
                        </div>
                    ) : (
                        <div className="contact-form">
                            <input
                                type="email"
                                placeholder="Tu correo electronico"
                                className="form-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <textarea
                                placeholder="En que podemos ayudarte?"
                                className="form-textarea"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows="4"
                            />
                            {contactError && <p className="contact-error">{contactError}</p>}
                            <button className="submit-button" onClick={handleContactSubmit}>
                                Enviar mensaje
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {showUpload && <Upload onClose={() => setShowUpload(false)} />}
        </div>
    );
};

export default Home;