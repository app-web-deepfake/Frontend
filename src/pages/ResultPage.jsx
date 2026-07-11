import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getAnalysisResult, submitAnalysisFeedback } from '../services/api';
import { useAuth } from '../context/authContext.jsx';
import { IconStar, IconExternalLink, IconImage } from '../components/Icons.jsx';
import '../styles/Result.css';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import FeedbackSection from '../components/FeedbackSection.jsx';
import ManipulationBar from '../components/ManipulationBar.jsx';

// ─── Artículos relacionados ───────────────────────────────────────────────────
const NOTICIAS_FAKE = [
    { tag: 'BBC MUNDO', texto: 'Como reconocer cuando una imagen o video ha sido manipulado digitalmente. Senales que debes buscar antes de compartir.', url: 'https://www.bbc.com/mundo/topics/cjnwl8dng9gt' },
    { tag: 'EL PAIS TECNOLOGIA', texto: 'Deepfakes: que son, como funcionan y por que representan un riesgo real para la sociedad.', url: 'https://elpais.com/noticias/inteligencia-artificial/' },
];
const NOTICIAS_REAL = [
    { tag: 'NATIONAL GEOGRAPHIC', texto: 'Por que verificar el origen de las imagenes antes de compartirlas es un habito cada vez mas necesario.', url: 'https://www.nationalgeographic.es/ciencia' },
    { tag: 'EL PAIS TECNOLOGIA', texto: 'Guia para identificar noticias falsas e imagenes manipuladas que circulan en redes sociales.', url: 'https://elpais.com/noticias/inteligencia-artificial/' },
];
const NOTICIAS_SUSPICIOUS = [
    { tag: 'MIT TECHNOLOGY REVIEW', texto: 'Por que los detectores de deepfakes no son perfectos y como interpretar sus resultados con cautela.', url: 'https://www.technologyreview.com/topic/artificial-intelligence/' },
    { tag: 'EL PAIS TECNOLOGIA', texto: 'Guia para identificar noticias falsas e imagenes manipuladas que circulan en redes sociales.', url: 'https://elpais.com/noticias/inteligencia-artificial/' },
];

// ─── Configuración de niveles de riesgo (incluye SUSPICIOUS) ─────────────────
const RISK_CONFIG = {
    LOW:        { label: 'Bajo',        color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
    MEDIUM:     { label: 'Medio',       color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
    SUSPICIOUS: { label: 'Sospechoso', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
    HIGH:       { label: 'Alto',        color: '#ea580c', bg: '#fff7ed', border: '#fed7aa' },
    CRITICAL:   { label: 'Crítico',    color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
};

// ─── Helper: convertir URL a base64 para el PDF ───────────────────────────────
async function imageUrlToBase64(url) {
    try {
        const res  = await fetch(url);
        const blob = await res.blob();
        return await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload  = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch { return null; }
}

// ─── Helper: obtener la URL de la imagen analizada ───────────────────────────
// Con Facia el campo era result.declined_proof.
// Con ZeroTrue usamos: result.fileUrl (guardado en MongoDB) O
// la URL pasada por location.state desde la página de análisis.
function getImageUrl(result, locationState) {
    return (
        locationState?.fileUrl       ||   // ← pasado por navigate('/result/...', { state: { fileUrl } })
        result?.fileUrl              ||   // ← guardado en el registro de MongoDB
        result?.declined_proof       ||   // ← compatibilidad con Facia (por si acaso)
        null
    );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function ResultPage() {
    const { referenceId } = useParams();
    const location        = useLocation();   // ← NUEVO: para leer fileUrl del state
    const navigate        = useNavigate();
    const { user }        = useAuth();

    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState(null);
    const [result, setResult]           = useState(null);
    const [retryCount, setRetryCount]   = useState(0);
    const [comment, setComment]         = useState('');
    const [rating, setRating]           = useState(0);
    const [commentSent, setCommentSent] = useState(false);
    const [pdfLoading, setPdfLoading]   = useState(false);
    const resultRef = useRef(null);

    useEffect(() => {
        if (!referenceId) { setError('No se proporcionó un ID de referencia'); setLoading(false); return; }
        fetchResult();
    }, [referenceId, retryCount]);

    const fetchResult = async () => {
        try {
            setLoading(true); setError(null);
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

    // ─── Generación de PDF ────────────────────────────────────────────────────
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
            const pageW = 210, margin = 18, contentW = pageW - margin * 2;
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

            // Encabezado
            pdf.setFillColor(64, 127, 194);
            pdf.rect(0, 0, pageW, 22, 'F');
            pdf.setFontSize(13); pdf.setFont('helvetica', 'bold'); pdf.setTextColor(255, 255, 255);
            pdf.text('Deepfake Detection - Resultado de Análisis', margin, 14);
            y = 30;

            const fecha = new Date().toLocaleDateString('es-ES', {
                day: '2-digit', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
            });
            addText('Fecha: ' + fecha, 9, false, [100, 100, 100]);
            addText('ID de referencia: ' + (result.analysisId || 'N/A'), 9, false, [100, 100, 100]);
            addText('Analizado por: ' + (user?.name || user?.email || 'Usuario'), 9, false, [100, 100, 100]);
            y += 4; addLine();

            // ── Imagen analizada ──────────────────────────────────────────────
            // CAMBIO: usamos getImageUrl() en lugar de result.declined_proof directamente
            const imageUrl = getImageUrl(result, location.state);
            if (imageUrl) {
                checkPage(75);
                const b64 = await imageUrlToBase64(imageUrl);
                if (b64) {
                    const imgType = b64.startsWith('data:image/png') ? 'PNG' : 'JPEG';
                    addText('Imagen analizada:', 10, true);
                    y += 2;
                    const tmpImg = new Image();
                    await new Promise(r => { tmpImg.onload = r; tmpImg.src = b64; });
                    const aspectRatio = tmpImg.naturalWidth / tmpImg.naturalHeight;
                    const imgW = Math.min(contentW * 0.5, 80);
                    const imgH = imgW / aspectRatio;
                    const imgX = margin + (contentW - imgW) / 2;
                    pdf.addImage(b64, imgType, imgX, y, imgW, imgH, undefined, 'FAST');
                    y += imgH + 6;
                    addLine();
                }
            }

            // ── Veredicto ─────────────────────────────────────────────────────
            checkPage(30);
            const esDeepfake = result.isDeepfake;
            const esSuspechoso = result.isSuspicious || result.riskLevel === 'SUSPICIOUS';
            const riskCfg = RISK_CONFIG[result.riskLevel];

            const bgColor  = result.isInconclusive
                ? (esSuspechoso ? [245, 243, 255] : [255, 251, 235])
                : esDeepfake ? [255, 235, 235] : [235, 255, 240];
            const txtColor = result.isInconclusive
                ? (esSuspechoso ? [109, 40, 217] : [146, 64, 14])
                : esDeepfake ? [220, 38, 38] : [22, 163, 74];

            pdf.setFillColor(...bgColor);
            pdf.roundedRect(margin, y, contentW, 18, 3, 3, 'F');
            pdf.setFontSize(12); pdf.setFont('helvetica', 'bold'); pdf.setTextColor(...txtColor);
            pdf.text(
                result.interpretedLabel || (esDeepfake ? 'El contenido es FALSO' : 'El contenido es AUTÉNTICO'),
                margin + 4, y + 11
            );
            y += 24;

            // ── Advertencias incertidumbre / SUSPICIOUS ───────────────────────
            if (esSuspechoso) {
                checkPage(15);
                addText('⚠ Resultado sospechoso: el análisis no es concluyente. Verifica la fuente antes de sacar conclusiones.', 9, false, [109, 40, 217]);
                y += 2;
            } else if (result.isInconclusive || result.isGreyZone) {
                checkPage(15);
                addText('⚠ Resultado con incertidumbre: verificar manualmente antes de sacar conclusiones.', 9, false, [146, 64, 14]);
                y += 2;
            }

            // ── Métricas ──────────────────────────────────────────────────────
            if (result.riskLevel) {
                checkPage(12);
                addText(
                    `Nivel de riesgo: ${riskCfg?.label || result.riskLevel}   |   ` +
                    `Trust Score: ${result.trustScore ?? 'N/A'} / 100   |   ` +
                    `Índice de manipulación: ${result.manipulationIndex ?? 'N/A'}%`,
                    10, false, [60, 60, 60]
                );
                y += 2;
            }

            addLine();
            addText('Explicación:', 10, true);
            addText(result.explanation || '', 10, false, [60, 60, 60]);
            y += 3; addLine();

            if (result.recommendations?.length) {
                checkPage(20);
                addText('Recomendaciones:', 10, true);
                result.recommendations.forEach(r => {
                    checkPage(10);
                    addText('• ' + r, 9, false, [60, 60, 60]);
                });
                y += 3; addLine();
            }

            // ── Datos técnicos ────────────────────────────────────────────────
            checkPage(40); addText('Información técnica', 11, true); y += 2;
            [
                ['Estado',                  esDeepfake ? 'Rechazado' : 'Aprobado'],
                ['Nivel de riesgo',         riskCfg?.label ? `${riskCfg.label} (${result.riskLevel})` : 'N/A'],
                ['Índice de manipulación',  (result.manipulationIndex ?? 'N/A') + '%'],
                ['Trust Score',             (result.trustScore ?? 'N/A') + ' / 100'],
                ['Resultado incierto',      result.isInconclusive ? 'Sí' : 'No'],
                ['Zona gris',               result.isGreyZone ? 'Sí' : 'No'],
                ['Resultado sospechoso',    esSuspechoso ? 'Sí' : 'No'],
                ['Rostro detectado',        result.hasFace != null ? (result.hasFace ? 'Sí' : 'No') : 'N/A'],
                ['Tipo de media',           result.mediaType || 'N/A'],
                ['Categoría',               result.analysisCategory || 'N/A'],
                ['ID',                      result.analysisId || 'N/A'],
            ].forEach(([label, valor]) => {
                checkPage(10);
                pdf.setFontSize(10);
                pdf.setFont('helvetica', 'bold'); pdf.setTextColor(60, 60, 60); pdf.text(label + ':', margin, y);
                pdf.setFont('helvetica', 'normal'); pdf.setTextColor(30, 30, 30); pdf.text(String(valor), margin + 60, y);
                y += 7;
            });

            pdf.setFontSize(8); pdf.setTextColor(160, 160, 160);
            pdf.text(
                'Informe generado automáticamente. Los resultados en zona de incertidumbre requieren verificación adicional.',
                margin, 285
            );
            pdf.save('resultado-' + (result.analysisId || 'deepfake').slice(0, 10) + '.pdf');
        } catch (e) {
            console.error('Error generando PDF:', e);
        } finally {
            setPdfLoading(false);
        }
    };

    const handleNewAnalysis = () => navigate('/home');
    const handleSendComment = () => { if (comment.trim()) { setCommentSent(true); setComment(''); } };

    // ─── Estados de carga y error ─────────────────────────────────────────────
    if (loading) return (
        <div className="result-page"><Navbar />
            <div className="result-main"><div className="loading-card">
                <div className="spinner"></div>
                <h2>Analizando tu archivo...</h2>
                <p>Por favor espera mientras procesamos la información.</p>
                <small>Intento {retryCount + 1}</small>
            </div></div>
        </div>
    );

    if (error) return (
        <div className="result-page"><Navbar />
            <div className="result-main"><div className="error-card">
                <h2>Hubo un problema</h2><p>{error}</p>
                <button className="btn-primary" onClick={handleNewAnalysis}>Intentar de nuevo</button>
            </div></div>
        </div>
    );

    if (!result) return null;

    // ─── Derivados del resultado ──────────────────────────────────────────────
    const isDeepfake    = result.isDeepfake;
    const isSuspicious  = result.isSuspicious || result.riskLevel === 'SUSPICIOUS';
    const riskCfg       = RISK_CONFIG[result.riskLevel] || null;
    const imageUrl      = getImageUrl(result, location.state);

    // Noticias según veredicto
    const noticias = isSuspicious
        ? NOTICIAS_SUSPICIOUS
        : isDeepfake ? NOTICIAS_FAKE : NOTICIAS_REAL;

    const userName = user?.name || user?.email || 'Usuario';

    // Clase CSS del veredicto
    const verdictClass = isSuspicious
        ? 'suspicious'
        : result.isInconclusive || result.isGreyZone
            ? 'inconclusive'
            : isDeepfake ? 'fake' : 'real';

    return (
        <div className="result-page">
            <Navbar />
            <div className="result-main" ref={resultRef}>
                <h1 className="page-title">Análisis completado</h1>
                <p className="page-subtitle">Algunos videos o imágenes pueden ser manipulados, ten cuidado.</p>

                {/* ── Preview de imagen ──────────────────────────────────── */}
                <div className="image-preview-box">
                    {imageUrl
                        ? <img src={imageUrl} alt="Imagen analizada" className="preview-image" />
                        : <div className="placeholder-image">
                            <IconImage size={48} color="#cbd5e0" />
                            <p>Imagen analizada</p>
                        </div>
                    }
                </div>

                {/* ── Acciones ───────────────────────────────────────────── */}
                <div className="result-actions">
                    <button className="btn-nuevo-analisis" onClick={handleNewAnalysis}>Nuevo análisis</button>
                    <button className="btn-descargar-pdf" onClick={descargarPDF} disabled={pdfLoading}>
                        {pdfLoading ? 'Generando PDF...' : 'Descargar PDF'}
                    </button>
                </div>

                {/* ── Caja de resultados ─────────────────────────────────── */}
                <div className="results-box">
                    <h2 className="results-title">Resultados</h2>

                    {/* Veredicto */}
                    <div className={`result-status ${verdictClass}`}>
                        {result.interpretedLabel || (isDeepfake ? 'El contenido es falso' : 'El contenido es auténtico')}
                    </div>

                    {/* Barra de manipulación — incluye descripción del nivel */}
                    {result.riskLevel && (
                        <ManipulationBar
                            manipulationIndex={result.manipulationIndex ?? 0}
                            riskLevel={result.riskLevel}
                            isInconclusive={result.isInconclusive || isSuspicious}
                            forceMax={result.analysisCategory === 'evasion'
                                && (result.riskLevel === 'HIGH' || result.riskLevel === 'CRITICAL')}
                        />
                    )}

                    {/* Explicación — solo para invalidCase o greyZone sin barra */}
                    {(result.invalidCase || (result.isGreyZone && !result.riskLevel)) && (
                        <div className="result-description">
                            <p>{result.explanation ||
                                result.invalidCase?.reason ||
                                'No fue posible determinar con certeza el nivel de manipulación.'}
                            </p>
                        </div>
                    )}

                    {/* Explicación normal cuando hay riskLevel */}
                    {result.riskLevel && (
                        <div className="result-description">
                            <p>{result.explanation || (isDeepfake
                                ? 'Hemos encontrado indicios de que este contenido pudo haber sido modificado digitalmente.'
                                : 'No encontramos señales de que este contenido haya sido alterado digitalmente.')}
                            </p>
                        </div>
                    )}

                    {/* Recomendaciones */}
                    {result.recommendations?.length > 0 && (
                        <div className="recommendations-box">
                            <strong className="recommendations-title">Recomendaciones</strong>
                            <ul className="recommendations-list">
                                {result.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                            </ul>
                        </div>
                    )}

                    {/* Alerta reincidencia */}
                    {result.recidivism?.isRecidivist && (
                        <div className="recidivism-alert">⚠️ {result.recidivism.message}</div>
                    )}

                    {/* Info técnica */}
                    <details className="technical-info">
                        <summary>Ver información técnica</summary>
                        <div className="tech-details">
                            <div className="tech-row"><span>Estado:</span><strong className={isDeepfake ? 'text-danger' : 'text-success'}>{isDeepfake ? 'Rechazado' : 'Aprobado'}</strong></div>
                            {result.riskLevel && <div className="tech-row"><span>Nivel de riesgo:</span><strong style={{ color: riskCfg?.color }}>{riskCfg?.label} ({result.riskLevel})</strong></div>}
                            {result.manipulationIndex != null && <div className="tech-row"><span>Índice de manipulación:</span><strong>{result.manipulationIndex}%</strong></div>}
                            {result.trustScore != null && <div className="tech-row"><span>Trust Score:</span><strong>{result.trustScore} / 100</strong></div>}
                            <div className="tech-row"><span>Resultado incierto:</span><strong>{result.isInconclusive ? 'Sí' : 'No'}</strong></div>
                            <div className="tech-row"><span>Resultado sospechoso:</span><strong>{isSuspicious ? 'Sí' : 'No'}</strong></div>
                            {result.hasFace != null && <div className="tech-row"><span>Rostro detectado:</span><strong>{result.hasFace ? 'Sí' : 'No'}</strong></div>}
                            {result.mediaType && <div className="tech-row"><span>Tipo de media:</span><strong>{result.mediaType}</strong></div>}
                            <div className="tech-row"><span>ID de referencia:</span><strong className="mono">{result.analysisId}</strong></div>
                            {result.analysisCategory && <div className="tech-row"><span>Categoría:</span><strong>{result.analysisCategory}</strong></div>}
                        </div>
                    </details>
                </div>

                <FeedbackSection
                    referenceId={result.analysisId}
                    systemVerdict={result.verdict}
                    onSubmit={(payload) => submitAnalysisFeedback(result.analysisId, payload)}
                />

                {/* Artículos relacionados */}
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
                                        Leer artículo <IconExternalLink size={13} color="currentColor" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Comentarios / experiencia */}
                <div className="comments-section">
                    <h2 className="comments-title">¿Cómo fue tu experiencia?</h2>
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
                        {commentSent
                            ? <div className="comment-sent">Gracias por tu opinión, {userName.split(' ')[0]}. Nos ayuda a mejorar.</div>
                            : <>
                                <textarea
                                    className="comment-textarea"
                                    placeholder="Escribe tu comentario..."
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                    rows="4"
                                />
                                <div className="comment-buttons">
                                    <button className="btn-enviar" onClick={handleSendComment}>Enviar</button>
                                    <button className="btn-cancelar" onClick={() => setComment('')}>Cancelar</button>
                                </div>
                            </>
                        }
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}