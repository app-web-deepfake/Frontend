// src/pages/ResultPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAnalysisResult } from '../services/api';
import { useAuth } from '../context/authContext.jsx';
import { IconStar, IconExternalLink, IconImage } from '../components/Icons.jsx';
import '../styles/Result.css';
import Navbar from "../components/Navbar.jsx";

const NOTICIAS_FAKE = [
    {
        tag: 'BBC MUNDO',
        texto: 'Como reconocer cuando una imagen o video ha sido manipulado digitalmente. Senales que debes buscar antes de compartir.',
        url: 'https://www.bbc.com/mundo/topics/cjnwl8dng9gt',
    },
    {
        tag: 'EL PAIS TECNOLOGIA',
        texto: 'Deepfakes: que son, como funcionan y por que representan un riesgo real para la sociedad.',
        url: 'https://elpais.com/noticias/deepfakes/',
    },
];

const NOTICIAS_REAL = [
    {
        tag: 'NATIONAL GEOGRAPHIC',
        texto: 'Por que verificar el origen de las imagenes antes de compartirlas es un habito cada vez mas necesario.',
        url: 'https://www.nationalgeographic.es/ciencia',
    },
    {
        tag: 'EL PAIS TECNOLOGIA',
        texto: 'Guia para identificar noticias falsas e imagenes manipuladas que circulan en redes sociales.',
        url: 'https://elpais.com/noticias/desinformacion/',
    },
];

export default function ResultPage() {
    const { referenceId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState(0);
    const [commentSent, setCommentSent] = useState(false);
    const [pdfLoading, setPdfLoading] = useState(false);
    const resultRef = useRef(null);

    const descargarPDF = async () => {
        setPdfLoading(true);
        try {
            const loadScript = (src) => new Promise((resolve, reject) => {
                if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
                const s = document.createElement('script');
                s.src = src;
                s.onload = resolve;
                s.onerror = reject;
                document.head.appendChild(s);
            });

            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');

            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

            const pageW = pdf.internal.pageSize.getWidth();   // 210mm
            const pageH = pdf.internal.pageSize.getHeight();  // 297mm
            const margin = 12;
            const contentW = pageW - margin * 2;
            const contentH = pageH - margin * 2;

            const canvas = await window.html2canvas(resultRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#f0f4f8',
                logging: false
            });

            const imgW = contentW;
            const imgH = (canvas.height * imgW) / canvas.width; // altura total en mm

            // Cuántos mm de contenido caben por página
            const pxPerMm = canvas.width / imgW;
            const sliceHeightPx = contentH * pxPerMm; // píxeles que caben en una página

            let offsetPx = 0;
            let pageNum = 0;

            while (offsetPx < canvas.height) {
                if (pageNum > 0) pdf.addPage();

                // Crear canvas recortado para esta página
                const sliceCanvas = document.createElement('canvas');
                const sliceH = Math.min(sliceHeightPx, canvas.height - offsetPx);
                sliceCanvas.width = canvas.width;
                sliceCanvas.height = sliceH;
                const ctx = sliceCanvas.getContext('2d');
                ctx.drawImage(canvas, 0, offsetPx, canvas.width, sliceH, 0, 0, canvas.width, sliceH);

                const sliceData = sliceCanvas.toDataURL('image/png');
                const sliceHeightMm = (sliceH / pxPerMm);
                pdf.addImage(sliceData, 'PNG', margin, margin, imgW, sliceHeightMm);

                offsetPx += sliceH;
                pageNum++;
            }

            pdf.save(`resultado-${result.analysisId?.slice(0, 8) || 'deepfake'}.pdf`);
        } catch (e) {
            console.error('Error generando PDF:', e);
        } finally {
            setPdfLoading(false);
        }
    };

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
            const response = await getAnalysisResult(referenceId);
            if (response.success && response.result) {
                setResult(response.result);
                setLoading(false);
            } else {
                setTimeout(() => setRetryCount(prev => prev + 1), 3000);
            }
        } catch (err) {
            setError(err.message || 'Error al obtener el resultado');
            setLoading(false);
        }
    };

    const handleNewAnalysis = () => navigate('/home');

    const handleSendComment = () => {
        if (comment.trim()) {
            setCommentSent(true);
            setComment('');
        }
    };

    const handleCancelComment = () => setComment('');

    if (loading) {
        return (
            <div className="result-page">
                <Navbar />
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

    if (error) {
        return (
            <div className="result-page">
                <Navbar />
                <div className="result-main">
                    <div className="error-card">
                        <div className="error-icon">⚠️</div>
                        <h2>Hubo un problema</h2>
                        <p>{error}</p>
                        <button className="btn-primary" onClick={handleNewAnalysis}>Intentar de nuevo</button>
                    </div>
                </div>
            </div>
        );
    }

    if (!result) return null;

    const isDeepfake = result.isDeepfake;
    const confidence = result.confidence;
    const noticias = isDeepfake ? NOTICIAS_FAKE : NOTICIAS_REAL;
    const userName = user?.name || user?.email || 'Usuario';

    return (
        <div className="result-page">
            <Navbar />
            <div className="result-main" ref={resultRef}>
                <h1 className="page-title">Analisis completado</h1>
                <p className="page-subtitle">
                    Algunos videos o imagenes pueden ser manipulados, ten cuidado.
                </p>

                {/* Imagen analizada */}
                <div className="image-preview-box">
                    {result.declined_proof ? (
                        <img src={result.declined_proof} alt="Imagen analizada" className="preview-image" />
                    ) : (
                        <div className="placeholder-image">
                            <IconImage size={48} color="#cbd5e0" />
                            <p>Imagen analizada</p>
                        </div>
                    )}
                </div>

                <div className="result-actions">
                    <button className="btn-nuevo-analisis" onClick={handleNewAnalysis}>
                        Nuevo analisis
                    </button>
                    <button className="btn-descargar-pdf" onClick={descargarPDF} disabled={pdfLoading}>
                        {pdfLoading ? 'Generando PDF...' : 'Descargar PDF'}
                    </button>
                </div>

                {/* Resultados */}
                <div className="results-box">
                    <h2 className="results-title">Resultados</h2>

                    <div className={`result-status ${isDeepfake ? 'fake' : 'real'}`}>
                        {isDeepfake ? 'El contenido es falso' : 'El contenido es auténtico'}
                    </div>

                    <div className="result-description">
                        <p>
                            {isDeepfake
                                ? 'Hemos encontrado indicios de que esta imagen o video pudo haber sido modificado con herramientas digitales. Antes de compartirlo, te recomendamos verificar de dónde proviene y quién lo publicó originalmente.'
                                : 'No encontramos señales de que este contenido haya sido alterado digitalmente. Todo indica que es auténtico. De todas formas, siempre es buena idea confirmar la fuente antes de compartir cualquier imagen o video.'}
                        </p>
                    </div>

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
                                <strong className="mono">{result.analysisId}</strong>
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

                {/* Noticias relacionadas */}
                <div className="sources-section">
                    <h2 className="sources-title">Artículos relacionados</h2>
                    <div className="sources-grid">
                        {noticias.map((n, i) => (
                            <div key={i} className="source-card">
                                <div className="source-content">
                                    <h3 className="source-tag">{n.tag}</h3>
                                    <p className="source-text">{n.texto}</p>
                                    <button
                                        className="source-btn"
                                        onClick={() => window.open(n.url, '_blank', 'noopener,noreferrer')}
                                    >
                                        Leer articulo <IconExternalLink size={13} color="currentColor" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Comentarios */}
                <div className="comments-section">
                    <h2 className="comments-title">¿Cómo fue tu experiencia?</h2>
                    <div className="comment-card">
                        <div className="comment-header">
                            <div className="comment-user">
                                <strong>{userName}</strong>
                                <div className="rating-stars">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <span
                                            key={star}
                                            onClick={() => setRating(star)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <IconStar size={22} filled={star <= rating} />
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {commentSent ? (
                            <div className="comment-sent">
                                ¡Gracias por tu opinión, {userName.split(' ')[0]}! Nos ayuda a mejorar.
                            </div>
                        ) : (
                            <>
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
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}