import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { sendSuggestion } from '../services/api.js';
import '../styles/Recomendaciones.css';

const recomendaciones = [
    {
        titulo: 'Verifica la fuente del contenido',
        descripcion:
            'Antes de compartir una imagen o video, investiga de dónde proviene. Los deepfakes suelen circular en redes sociales sin atribución clara. Busca la fuente original usando búsqueda inversa de imágenes en Google o TinEye.',
        nivel: 'basico',
        tag: 'Verificación',
    },
    {
        titulo: 'Observa los detalles del rostro',
        descripcion:
            'Los deepfakes frecuentemente fallan en áreas como los bordes del cabello, las orejas, los dientes o los ojos. Busca bordes difuminados, parpadeos extraños o inconsistencias en la iluminación del rostro.',
        nivel: 'basico',
        tag: 'Detección visual',
    },
    {
        titulo: 'Analiza la sincronía audio-video',
        descripcion:
            'En videos manipulados, el movimiento de los labios no siempre coincide perfectamente con el audio. Presta atención a si las palabras suenan natural con los gestos faciales.',
        nivel: 'intermedio',
        tag: 'Video',
    },
    {
        titulo: 'Revisa la iluminación y las sombras',
        descripcion:
            'Las sombras y reflejos en los ojos o la piel deben ser consistentes en todo el video. Una fuente de luz que cambia abruptamente o sombras inconsistentes son señales claras de manipulación digital.',
        nivel: 'intermedio',
        tag: 'Detección visual',
    },
    {
        titulo: 'Usa herramientas de verificación',
        descripcion:
            'Apóyate en herramientas especializadas para analizar contenido sospechoso. Los algoritmos de detección pueden identificar patrones de manipulación que el ojo humano no percibe fácilmente.',
        nivel: 'avanzado',
        tag: 'Herramientas',
    },
    {
        titulo: 'No compartas sin verificar',
        descripcion:
            'Si tienes dudas sobre la autenticidad de un contenido, es mejor no compartirlo. Difundir deepfakes puede causar daño real a personas, reputaciones e instituciones.',
        nivel: 'basico',
        tag: 'Hábitos',
    },
    {
        titulo: 'Atención al contexto emocional',
        descripcion:
            'Los deepfakes suelen usarse para generar contenido emotivo o escandaloso que provoque reacciones inmediatas. Si algo te parece demasiado impactante, tómate un momento antes de reaccionar o compartir.',
        nivel: 'intermedio',
        tag: 'Conciencia',
    },
    {
        titulo: 'Protege tu identidad digital',
        descripcion:
            'Limita la cantidad de fotos y videos de alta resolución que publicas en redes sociales. Cualquier imagen pública puede ser usada para entrenar modelos que generen contenido falso con tu rostro.',
        nivel: 'avanzado',
        tag: 'Privacidad',
    },
    {
        titulo: 'Verifica los metadatos del archivo',
        descripcion:
            'Las imágenes originales contienen metadatos EXIF con información de la cámara, fecha y ubicación. Los deepfakes suelen tener estos datos eliminados o inconsistentes. Puedes verificarlos con herramientas gratuitas en línea.',
        nivel: 'avanzado',
        tag: 'Herramientas',
    },
    {
        titulo: 'Desconfía de videos virales sin contexto',
        descripcion:
            'Si un video se vuelve viral muy rápido y muestra a una figura pública en una situación escandalosa, es una señal de alerta. Busca cobertura del mismo evento en medios de comunicación reconocidos antes de creerlo.',
        nivel: 'basico',
        tag: 'Conciencia',
    },
    {
        titulo: 'Observa la textura de la piel',
        descripcion:
            'La piel generada por IA tiende a verse demasiado suave o con patrones repetitivos. En imágenes reales, la piel tiene poros, imperfecciones y variaciones naturales de color que los modelos de IA aún no replican perfectamente.',
        nivel: 'intermedio',
        tag: 'Detección visual',
    },
    {
        titulo: 'Comparte estos conocimientos',
        descripcion:
            'Difunde estos consejos entre familiares y amigos, especialmente con personas mayores que pueden ser más vulnerables a la desinformación. La educación colectiva es la mejor defensa contra los deepfakes.',
        nivel: 'basico',
        tag: 'Comunidad',
    },
];

const NIVELES = ['todos', 'basico', 'intermedio', 'avanzado'];

const nivelConfig = {
    basico:     { label: 'Básico',      className: 'nivel-basico' },
    intermedio: { label: 'Intermedio',  className: 'nivel-intermedio' },
    avanzado:   { label: 'Avanzado',    className: 'nivel-avanzado' },
};

export default function Recomendaciones() {
    const navigate = useNavigate();
    const [filtroNivel, setFiltroNivel] = useState('todos');
    const [busqueda, setBusqueda]       = useState('');
    const [suggestion, setSuggestion]   = useState('');
    const [suggStatus, setSuggStatus]   = useState(null);
    const [suggError, setSuggError]     = useState('');
    const [expandida, setExpandida]     = useState(null);

    const recomsFiltradas = useMemo(() => {
        return recomendaciones.filter(r => {
            const coincideNivel = filtroNivel === 'todos' || r.nivel === filtroNivel;
            const texto = busqueda.toLowerCase();
            const coincideBusq = !busqueda ||
                r.titulo.toLowerCase().includes(texto) ||
                r.descripcion.toLowerCase().includes(texto) ||
                r.tag.toLowerCase().includes(texto);
            return coincideNivel && coincideBusq;
        });
    }, [filtroNivel, busqueda]);

    const handleSuggestion = async (e) => {
        e.preventDefault();
        if (suggestion.trim().length < 10) {
            setSuggError('El mensaje debe tener al menos 10 caracteres.');
            return;
        }
        setSuggStatus('sending');
        setSuggError('');
        try {
            await sendSuggestion(suggestion.trim());
            setSuggStatus('ok');
            setSuggestion('');
        } catch (err) {
            setSuggError(err.message || 'Error al enviar. Intenta de nuevo.');
            setSuggStatus('error');
        }
    };

    const toggleExpandida = (i) => setExpandida(prev => prev === i ? null : i);

    return (
        <div className="recom-page">
            <Navbar />

            <div className="recom-main">

                {/* Header */}
                <div className="recom-header">
                    <span className="recom-badge">Guía de seguridad digital</span>
                    <h1 className="recom-title">Recomendaciones</h1>
                    <p className="recom-subtitle">
                        Aprende a identificar y protegerte del contenido deepfake.
                        Estos consejos están pensados para navegar el mundo digital con más confianza y seguridad.
                    </p>
                    <div className="recom-stats">
                        <div className="stat-item">
                            <span className="stat-num">{recomendaciones.length}</span>
                            <span className="stat-label">consejos</span>
                        </div>
                        <div className="stat-divider" />
                        <div className="stat-item">
                            <span className="stat-num">3</span>
                            <span className="stat-label">niveles</span>
                        </div>
                        <div className="stat-divider" />
                        <div className="stat-item">
                            <span className="stat-num">6</span>
                            <span className="stat-label">categorías</span>
                        </div>
                    </div>
                </div>

                {/* Controles */}
                <div className="recom-controles">
                    <div className="recom-search-wrap">
                        <svg className="search-icon-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        <input
                            type="text"
                            className="recom-search"
                            placeholder="Buscar consejo..."
                            value={busqueda}
                            onChange={e => setBusqueda(e.target.value)}
                        />
                        {busqueda && (
                            <button className="search-clear" onClick={() => setBusqueda('')} aria-label="Limpiar búsqueda">×</button>
                        )}
                    </div>

                    <div className="recom-filtros">
                        {NIVELES.map(n => (
                            <button
                                key={n}
                                className={`filtro-btn ${filtroNivel === n ? 'filtro-activo' : ''} ${n !== 'todos' ? `filtro-${n}` : ''}`}
                                onClick={() => setFiltroNivel(n)}
                            >
                                {n === 'todos' ? 'Todos' : nivelConfig[n].label}
                            </button>
                        ))}
                    </div>
                </div>

                {(busqueda || filtroNivel !== 'todos') && (
                    <p className="recom-contador">
                        {recomsFiltradas.length === 0
                            ? 'No hay resultados para tu búsqueda.'
                            : `${recomsFiltradas.length} consejo${recomsFiltradas.length !== 1 ? 's' : ''} encontrado${recomsFiltradas.length !== 1 ? 's' : ''}`
                        }
                    </p>
                )}

                {/* Grid */}
                <div className="recom-grid">
                    {recomsFiltradas.map((r, i) => {
                        const cfg    = nivelConfig[r.nivel];
                        const isOpen = expandida === i;
                        return (
                            <div
                                key={i}
                                className={`recom-card ${isOpen ? 'recom-card--open' : ''}`}
                                onClick={() => toggleExpandida(i)}
                            >
                                <div className="card-top">
                                    <div className="card-meta">
                                        <span className={`recom-nivel ${cfg.className}`}>{cfg.label}</span>
                                        <span className="card-tag">{r.tag}</span>
                                    </div>
                                    <span className={`card-chevron ${isOpen ? 'card-chevron--up' : ''}`}>›</span>
                                </div>
                                <h3 className="recom-card-title">{r.titulo}</h3>
                                <div className={`recom-card-desc-wrap ${isOpen ? 'recom-card-desc-wrap--open' : ''}`}>
                                    <p className="recom-card-desc">{r.descripcion}</p>
                                </div>
                            </div>
                        );
                    })}

                    {recomsFiltradas.length === 0 && (
                        <div className="recom-empty">
                            <p className="empty-msg">No encontramos consejos con esos criterios.</p>
                            <button
                                className="empty-reset"
                                onClick={() => { setBusqueda(''); setFiltroNivel('todos'); }}
                            >
                                Ver todos los consejos
                            </button>
                        </div>
                    )}
                </div>

                {/* Leyenda */}
                <div className="recom-leyenda">
                    <p className="leyenda-titulo">¿Qué significan los niveles?</p>
                    <div className="leyenda-items">
                        <div className="leyenda-item">
                            <span className="recom-nivel nivel-basico">Básico</span>
                            <span className="leyenda-desc">Hábitos simples que cualquier persona puede adoptar hoy mismo.</span>
                        </div>
                        <div className="leyenda-item">
                            <span className="recom-nivel nivel-intermedio">Intermedio</span>
                            <span className="leyenda-desc">Requiere algo de atención y práctica, pero es muy efectivo.</span>
                        </div>
                        <div className="leyenda-item">
                            <span className="recom-nivel nivel-avanzado">Avanzado</span>
                            <span className="leyenda-desc">Para quienes quieren profundizar en la verificación técnica.</span>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="recom-cta">
                    <div className="cta-box">
                        <div className="cta-text">
                            <h2>¿Tienes un contenido sospechoso?</h2>
                            <p>Usa nuestra herramienta de análisis para verificarlo en segundos.</p>
                        </div>
                        <button className="cta-btn" onClick={() => navigate('/home')}>
                            Analizar ahora
                        </button>
                    </div>
                </div>

                {/* Sugerencias */}
                <div className="recom-contact">
                    <div className="contact-box">
                        <h2 className="contact-title">¿Tienes una duda o sugerencia?</h2>
                        <p className="contact-subtitle">Escríbenos y te responderemos lo antes posible.</p>
                        {suggStatus === 'ok' ? (
                            <div className="contact-success">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"/>
                                </svg>
                                Mensaje enviado. Te responderemos pronto.
                            </div>
                        ) : (
                            <form className="contact-form" onSubmit={handleSuggestion}>
                                <textarea
                                    className="contact-textarea"
                                    rows={4}
                                    placeholder="Escribe tu duda o sugerencia aquí..."
                                    value={suggestion}
                                    onChange={e => { setSuggestion(e.target.value); setSuggStatus(null); setSuggError(''); }}
                                    disabled={suggStatus === 'sending'}
                                />
                                {suggError && <p className="contact-error">{suggError}</p>}
                                <button type="submit" className="contact-submit-btn" disabled={suggStatus === 'sending'}>
                                    {suggStatus === 'sending' ? 'Enviando...' : 'Enviar mensaje'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

            </div>
            <Footer />
        </div>
    );
}
