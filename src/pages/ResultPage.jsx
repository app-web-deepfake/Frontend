// src/pages/ResultPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAnalysisResult } from '../services/api';
import '../styles/Result.css';
import Navbar from "../components/Navbar.jsx";

export default function ResultPage() {
    const { referenceId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState(5);

    useEffect(() => {
        if (!referenceId) {
            setError('No se proporcionó un ID de referencia');
            setLoading(false);
            return;
        }

        fetchResult();
    }, [referenceId, retryCount]);

    const fetchResult = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log("🔍 Consultando resultado...", referenceId);

            const response = await getAnalysisResult(referenceId);

            if (response.success && response.result) {
                setResult(response.result);
                setLoading(false);
            } else {
                console.log("⏳ Resultado no disponible aún, reintentando...");
                setTimeout(() => {
                    setRetryCount(prev => prev + 1);
                }, 3000);
            }

        } catch (err) {
            console.error("❌ Error obteniendo resultado:", err);
            setError(err.message || 'Error al obtener el resultado');
            setLoading(false);
        }
    };

    const handleNewAnalysis = () => {
        navigate('/home');
    };

    const handleSendComment = () => {
        if (comment.trim()) {
            alert('¡Gracias por tu comentario! Tu opinión nos ayuda a mejorar.');
            setComment('');
        } else {
            alert('Por favor, escribe un comentario antes de enviar.');
        }
    };

    const handleCancelComment = () => {
        if (comment.trim() && window.confirm('¿Estás seguro de que quieres borrar tu comentario?')) {
            setComment('');
        } else if (!comment.trim()) {
            setComment('');
        }
    };

    // Loading State
    if (loading) {
        return (
            <div className="result-page">
                <Navbar/>

                <div className="result-main">
                    <div className="loading-card">
                        <div className="spinner"></div>
                        <h2>Analizando tu archivo...</h2>
                        <p>Por favor espera mientras procesamos la información.</p>
                        <small>Intento {retryCount + 1}</small>
                    </div>
                </div>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="result-page">
                <Navbar/>

                <div className="result-main">
                    <div className="error-card">
                        <div className="error-icon">⚠️</div>
                        <h2>Hubo un problema</h2>
                        <p>{error}</p>
                        <button className="btn-primary" onClick={handleNewAnalysis}>
                            Intentar de nuevo
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!result) {
        return null;
    }

    // Determinar si es deepfake o no
    const isDeepfake = result.status === 0;
    const confidence = (result.deepfake_score * 100).toFixed(1);

    return (
        <div className="result-page">
            {/* Header */}
            <Navbar/>

            {/* Main Content */}
            <div className="result-main">
                {/* Title */}
                <h1 className="page-title">Análisis completado</h1>
                <p className="page-subtitle">
                    Algunos videos o imágenes pueden ser manipulados, ten cuidado.
                </p>

                {/* Image Preview */}
                <div className="image-preview-box">
                    {result.declined_proof ? (
                        <img
                            src={result.declined_proof}
                            alt="Imagen analizada"
                            className="preview-image"
                        />
                    ) : (
                        <div className="placeholder-image">
                            <span>📷</span>
                            <p>Imagen analizada</p>
                        </div>
                    )}
                </div>

                {/* New Analysis Button */}
                <button className="btn-eliminar" onClick={handleNewAnalysis}>
                    Nuevo análisis
                </button>

                {/* Results Section */}
                <div className="results-box">
                    <h2 className="results-title">Resultados</h2>

                    <div className={`result-status ${isDeepfake ? 'fake' : 'real'}`}>
                        {isDeepfake ? 'El video es falso' : 'El contenido es auténtico'}
                    </div>

                    <div className="result-description">
                        <p>
                            {isDeepfake
                                ? 'Nuestro sistema ha detectado señales de manipulación digital en este archivo. Es posible que haya sido alterado o creado artificialmente. Te recomendamos tener precaución al compartir este contenido y verificar su origen antes de tomarlo como verídico.'
                                : 'Nuestro sistema no ha detectado señales evidentes de manipulación digital. El contenido parece ser auténtico. Sin embargo, siempre es importante verificar la fuente de cualquier contenido que compartas.'}
                        </p>
                    </div>

                    {/* Technical Details */}
                    <details className="technical-info">
                        <summary>Ver información técnica</summary>
                        <div className="tech-details">
                            <div className="tech-row">
                                <span>Estado:</span>
                                <strong className={isDeepfake ? 'text-danger' : 'text-success'}>
                                    {isDeepfake ? 'Rechazado' : 'Aprobado'}
                                </strong>
                            </div>
                            <div className="tech-row">
                                <span>Confianza:</span>
                                <strong>{confidence}%</strong>
                            </div>
                            <div className="tech-row">
                                <span>ID de referencia:</span>
                                <strong className="mono">{result.reference_id}</strong>
                            </div>
                            {result.decline_reason && (
                                <div className="tech-row">
                                    <span>Motivo:</span>
                                    <strong>{result.decline_reason}</strong>
                                </div>
                            )}
                        </div>
                    </details>
                </div>

                {/* Related Sources */}
                <div className="sources-section">
                    <h2 className="sources-title">Fuentes relacionadas</h2>

                    <div className="sources-grid">
                        {/* Source 1 */}
                        <div className="source-card">
                            <div className="source-image">
                                <img
                                    src="https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?w=300&h=200&fit=crop"
                                    alt="BBC News"
                                />
                            </div>
                            <div className="source-content">
                                <h3 className="source-tag">BBC NEWS</h3>
                                <p className="source-text">
                                    Cómo identificar deepfakes y contenido manipulado en redes sociales.
                                    Guía práctica para protegerte de la desinformación.
                                </p>
                                <button className="source-btn">Leer más</button>
                            </div>
                        </div>

                        {/* Source 2 */}
                        <div className="source-card">
                            <div className="source-image">
                                <img
                                    src="https://images.unsplash.com/photo-1584931423298-c576fda54bd2?w=300&h=200&fit=crop"
                                    alt="Verificación"
                                />
                            </div>
                            <div className="source-content">
                                <h3 className="source-tag">PANDEMIA</h3>
                                <p className="source-text">
                                    Los peligros de compartir información no verificada.
                                    Aprende a verificar noticias antes de difundirlas.
                                </p>
                                <button className="source-btn">Leer más</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Comments Section */}
                <div className="comments-section">
                    <h2 className="comments-title">Deja un comentario para mejorar</h2>

                    <div className="comment-card">
                        <div className="comment-header">
                            <div className="comment-user">
                                <strong>Erick Rosas</strong>
                                <div className="rating-stars">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <span
                                            key={star}
                                            className={`star ${star <= rating ? 'active' : ''}`}
                                            onClick={() => setRating(star)}
                                        >
                                            ★
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <textarea
                            className="comment-textarea"
                            placeholder="Escribe tu comentario..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows="4"
                        />

                        <div className="comment-buttons">
                            <button className="btn-enviar" onClick={handleSendComment}>
                                Enviar
                            </button>
                            <button className="btn-cancelar" onClick={handleCancelComment}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}