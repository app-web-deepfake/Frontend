import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import '../styles/Recomendaciones.css';

const recomendaciones = [
    {
        titulo: 'Verifica la fuente del contenido',
        descripcion:
            'Antes de compartir una imagen o video, investiga de dónde proviene. Los deepfakes suelen circular en redes sociales sin atribución clara. Busca la fuente original usando búsqueda inversa de imágenes.',
        nivel: 'básico',
    },
    {
        titulo: 'Observa los detalles del rostro',
        descripcion:
            'Los deepfakes frecuentemente fallan en áreas como los bordes del cabello, las orejas, los dientes o los ojos. Busca bordes difuminados, parpadeos extraños o inconsistencias en la iluminación del rostro.',
        nivel: 'básico',
    },
    {
        titulo: 'Analiza la sincronía audio-video',
        descripcion:
            'En videos manipulados, el movimiento de los labios no siempre coincide perfectamente con el audio. Presta atención a si las palabras suenan natural con los gestos faciales.',
        nivel: 'intermedio',
    },
    {
        titulo: 'Revisa la iluminación y sombras',
        descripcion:
            'Las sombras y reflejos en los ojos o piel deben ser consistentes en todo el video. Una fuente de luz que "salta" o sombras inconsistentes son señales de manipulación.',
        nivel: 'intermedio',
    },
    {
        titulo: 'Usa herramientas de verificación',
        descripcion:
            'Apóyate en herramientas especializadas para analizar contenido sospechoso. Los algoritmos de detección pueden identificar patrones de manipulación que el ojo humano no percibe fácilmente.',
        nivel: 'avanzado',
    },
    {
        titulo: 'No compartas sin verificar',
        descripcion:
            'Si tienes dudas sobre la autenticidad de un contenido, es mejor no compartirlo. Difundir deepfakes puede causar daño real a personas, reputaciones e instituciones.',
        nivel: 'básico',
    },
    {
        titulo: 'Atención al contexto emocional',
        descripcion:
            'Los deepfakes suelen usarse para generar contenido emotivo o escandaloso que provoque reacciones inmediatas. Si algo te parece demasiado impactante, tómate un momento antes de reaccionar.',
        nivel: 'intermedio',
    },
    {
        titulo: 'Protege tu identidad digital',
        descripcion:
            'Limita la cantidad de fotos y videos de alta resolución que publicas en redes sociales. Cualquier imagen pública puede ser usada para entrenar modelos que generen contenido falso con tu rostro.',
        nivel: 'avanzado',
    },
];

const nivelColor = {
    básico: { bg: '#dcfce7', color: '#16a34a', label: 'Básico' },
    intermedio: { bg: '#fef9c3', color: '#ca8a04', label: 'Intermedio' },
    avanzado: { bg: '#fee2e2', color: '#dc2626', label: 'Avanzado' },
};

export default function Recomendaciones() {
    const navigate = useNavigate();

    return (
        <div className="recom-page">
            <Navbar />

            <div className="recom-main">
                <div className="recom-header">
                    <h1 className="recom-title">Recomendaciones</h1>
                    <p className="recom-subtitle">
                        Aprende a identificar y protegerte del contenido deepfake. Estos consejos te ayudarán
                        a navegar el contenido digital de forma más segura.
                    </p>
                </div>

                {/* Leyenda de niveles */}
                <div className="recom-leyenda">
                    {Object.entries(nivelColor).map(([key, val]) => (
                        <span key={key} className="leyenda-chip" style={{ background: val.bg, color: val.color }}>
                            {val.label}
                        </span>
                    ))}
                </div>

                <div className="recom-grid">
                    {recomendaciones.map((r, i) => {
                        const nivel = nivelColor[r.nivel];
                        return (
                            <div key={i} className="recom-card">
                                <span
                                    className="recom-nivel"
                                    style={{ background: nivel.bg, color: nivel.color }}
                                >
                                    {nivel.label}
                                </span>
                                <h3 className="recom-card-title">{r.titulo}</h3>
                                <p className="recom-card-desc">{r.descripcion}</p>
                            </div>
                        );
                    })}
                </div>

                <div className="recom-cta">
                    <div className="cta-box">
                        <h2>¿Tienes un contenido sospechoso?</h2>
                        <p>Usa nuestra herramienta de análisis para verificarlo en segundos.</p>
                        <button className="cta-btn" onClick={() => navigate('/home')}>
                            Analizar ahora →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}