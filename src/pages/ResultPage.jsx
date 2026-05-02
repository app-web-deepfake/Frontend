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
                s.src = src; s.onload = resolve; s.onerror = reject;
                document.head.appendChild(s);
            });

            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');

            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pageW = 210;
            const margin = 18;
            const contentW = pageW - margin * 2;
            let y = margin;

            const addText = (text, size, bold, color) => {
                pdf.setFontSize(size);
                pdf.setFont('helvetica', bold ? 'bold' : 'normal');
                pdf.setTextColor(...(color || [30, 30, 30]));
                const lines = pdf.splitTextToSize(String(text), contentW);
                pdf.text(lines, margin, y);
                y += lines.length * (size * 0.4) + 2;
            };

            const addLine = () => {
                pdf.setDrawColor(220, 220, 220);
                pdf.line(margin, y, pageW - margin, y);
                y += 5;
            };

            const checkPage = (needed = 20) => {
                if (y + needed > 280) { pdf.addPage(); y = margin; }
            };

            // Encabezado azul
            pdf.setFillColor(64, 127, 194);
            pdf.rect(0, 0, pageW, 22, 'F');
            pdf.setFontSize(13);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(255, 255, 255);
            pdf.text('Deepfake Detection - Resultado de Analisis', margin, 14);
            y = 30;

            const fecha = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
            addText('Fecha: ' + fecha, 9, false, [100, 100, 100]);
            addText('ID de referencia: ' + (result.analysisId || 'N/A'), 9, false, [100, 100, 100]);
            y += 4;
            addLine();

            // Veredicto
            checkPage(30);
            const esDeepfake = result.isDeepfake;
            pdf.setFillColor(...(esDeepfake ? [255, 235, 235] : [235, 255, 240]));
            pdf.roundedRect(margin, y, contentW, 18, 3, 3, 'F');
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(...(esDeepfake ? [220, 38, 38] : [22, 163, 74]));
            pdf.text(esDeepfake ? 'Resultado: El contenido es FALSO' : 'Resultado: El contenido es AUTENTICO', margin + 4, y + 11);
            y += 24;

            // Explicacion
            checkPage(25);
            addText('Explicacion:', 10, true);
            addText(
                esDeepfake
                    ? 'Se encontraron indicios de que esta imagen o video pudo haber sido modificado con herramientas digitales. Se recomienda verificar el origen antes de compartirlo.'
                    : 'No se encontraron senales de alteracion digital. El contenido parece autentico. Se recomienda confirmar la fuente antes de compartir.',
                10, false, [60, 60, 60]
            );
            y += 3;
            addLine();

            // Datos tecnicos
            checkPage(40);
            addText('Informacion tecnica', 11, true);
            y += 2;

            [
                ['Estado', esDeepfake ? 'Rechazado' : 'Aprobado'],
                ['Confianza', (result.confidence || 'N/A') + '%'],
                ['ID', result.analysisId || 'N/A'],
                ...(result.decline_reason ? [['Motivo', result.decline_reason]] : []),
            ].forEach(([label, valor]) => {
                checkPage(10);
                pdf.setFontSize(10);
                pdf.setFont('helvetica', 'bold'); pdf.setTextColor(60, 60, 60);
                pdf.text(label + ':', margin, y);
                pdf.setFont('helvetica', 'normal'); pdf.setTextColor(30, 30, 30);
                pdf.text(String(valor), margin + 45, y);
                y += 7;
            });

            y += 3;
            addLine();
            checkPage(15);
            addText('Analizado por:', 10, true);
            addText(user?.name || user?.email || 'Usuario', 10, false, [60, 60, 60]);

            pdf.setFontSize(8);
            pdf.setTextColor(160, 160, 160);
            pdf.text('Informe generado automaticamente por la plataforma de deteccion de deepfakes.', margin, 285);

            pdf.save('resultado-' + (result.analysisId || 'deepfake').slice(0, 10) + '.pdf');
        } catch (e) {
            console.error('Error generando PDF:', e);
        } finally {
            setPdfLoading(false);
        }
    };

    useEffect(() => {
        if (!referenceId) {
            setError('No se proporciono un ID de referencia');
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
    const handleSendComment = () => { if (comment.trim()) { setCommentSent(true); setComment(''); } };

    if (loading) {
        return (
            <div className="result-page">
                <Navbar />
                <div className="result-main">
                    <div className="loading-card">
                        <div className="spinner"></div>
                        <h2>Analizando tu archivo...</h2>
                        <p>Por favor espera mientras procesamos la informacion.</p>
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

                <div className="results-box">
                    <h2 className="results-title">Resultados</h2>

                    <div className={`result-status ${isDeepfake ? 'fake' : 'real'}`}>
                        {isDeepfake ? 'El contenido es falso' : 'El contenido es autentico'}
                    </div>

                    <div className="result-description">
                        <p>
                            {isDeepfake
                                ? 'Hemos encontrado indicios de que esta imagen o video pudo haber sido modificado con herramientas digitales. Antes de compartirlo, te recomendamos verificar de donde proviene y quien lo publico originalmente.'
                                : 'No encontramos senales de que este contenido haya sido alterado digitalmente. Todo indica que es autentico. De todas formas, siempre es buena idea confirmar la fuente antes de compartir cualquier imagen o video.'}
                        </p>
                    </div>

                    <details className="technical-info">
                        <summary>Ver informacion tecnica</summary>
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

                <div className="sources-section">
                    <h2 className="sources-title">Articulos relacionados</h2>
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

                <div className="comments-section">
                    <h2 className="comments-title">Como fue tu experiencia?</h2>
                    <div className="comment-card">
                        <div className="comment-header">
                            <div className="comment-user">
                                <strong>{userName}</strong>
                                <div className="rating-stars">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <span key={star} onClick={() => setRating(star)} style={{ cursor: 'pointer' }}>
                                            <IconStar size={22} filled={star <= rating} />
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {commentSent ? (
                            <div className="comment-sent">
                                Gracias por tu opinion, {userName.split(' ')[0]}. Nos ayuda a mejorar.
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
                                    <button className="btn-enviar" onClick={handleSendComment}>Enviar</button>
                                    <button className="btn-cancelar" onClick={() => setComment('')}>Cancelar</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}