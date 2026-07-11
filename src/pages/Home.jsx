import React, { useState } from 'react';
import '../styles/Home.css';
import Upload from "../components/Upload.jsx";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import StreakBadge from "../components/StreakBadge.jsx";
import Leaderboard from "../components/Leaderboard.jsx";
import { useAuth } from "../context/authContext.jsx";
import { IconUpload } from "../components/Icons.jsx";
import img1 from '../assets/1.png';
import img2 from '../assets/2.png';

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

                {/* Racha + Ranking */}
                {user && (
                    <div className="home-gamification-row">
                        <StreakBadge />
                        <Leaderboard />
                    </div>
                )}
            </section>

            {/* Pasos */}
            <section className="instructions-section">
                <h2 className="section-title">¿Cómo funciona?</h2>
                <div className="steps">
                    <div className="step">
                        <div className="step-number">1</div>
                        <div>
                            <p className="step-text">Haz clic en el botón naranja</p>
                            <p className="step-desc">Se abrirá una ventana para elegir el archivo desde tu dispositivo.</p>
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
                            <p className="step-desc">El sistema analizará el contenido y te explicará si es auténtico o fue alterado digitalmente.</p>
                        </div>
                    </div>
                </div>

                {/* Video tutorial */}
                <div className="video-section">
                    <div className="video-wrapper">
                        <iframe
                            src="https://www.youtube.com/embed/6FWQzLDYyXU"
                            title="Como funciona YingYangAI"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                </div>
            </section>

            {/* Comparativa de precisión */}
            <section className="precision-section">
                <h2 className="section-title">¿Por qué YingYangAI?</h2>
                <p className="precision-subtitle">
                    Nuestro modelo analiza patrones visuales con mayor profundidad que las soluciones genéricas del mercado
                </p>
                <div className="precision-cards">
                    {/* Card API externa */}
                    <div className="precision-card external">
                        <div className="precision-card-img-placeholder">
                            <img src={img1} alt="img1" />
                        </div>
                        <div className="precision-card-body">
                            <p className="precision-card-label">APIs o modelos existentes</p>
                            <p className="precision-card-name">Soluciones genéricas</p>
                            <div className="precision-bar-wrap">
                                <div className="precision-bar external-bar" style={{ width: '65%' }}>
                                    <span className="precision-bar-pct">65%</span>
                                </div>
                            </div>
                            <p className="precision-card-desc">
                                Modelos entrenados en datos genéricos con menor sensibilidad a manipulaciones específicas de imágenes y videos locales.
                            </p>
                        </div>
                    </div>

                    {/* VS divider */}
                    <div className="precision-vs">VS</div>

                    {/* Card modelo propio */}
                    <div className="precision-card own highlighted">
                        <div className="precision-card-img-placeholder own-placeholder">
                            <img src={img2} alt="img2" />
                        </div>
                        <div className="precision-card-body">
                            <p className="precision-card-label">Nuestro modelo</p>
                            <p className="precision-card-name">YingYangAI</p>
                            <div className="precision-bar-wrap">
                                <div className="precision-bar own-bar" style={{ width: '85%' }}>
                                    <span className="precision-bar-pct">95%</span>
                                </div>
                            </div>
                            <p className="precision-card-desc">
                                Entrenado y ajustado específicamente para detectar deepfakes e imágenes generadas por IA con mayor sensibilidad y menos falsos positivos.
                            </p>
                            <span className="precision-badge">✓ Mayor precisión</span>
                        </div>
                    </div>
                </div>
                <p className="precision-note">* Porcentajes basados en evaluaciones internas con dataset de validación propio.</p>
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
            <Footer />
        </div>
    );
};

export default Home;
