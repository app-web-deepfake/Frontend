import React, { useEffect, useState } from 'react';

/**
 * ManipulationBar
 * Barra de progreso visual que muestra el índice de manipulación.
 * Diseñada para adultos de 40-65 años: grande, clara, sin ambigüedad.
 *
 * Props:
 *  - manipulationIndex: number (0-100)
 *  - riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
 *  - isInconclusive: boolean
 */

const RISK_LABELS = {
    LOW:      { text: 'Muy baja probabilidad de manipulación', color: '#16a34a', bar: '#22c55e', bg: '#f0fdf4', border: '#bbf7d0' },
    MEDIUM:   { text: 'Probabilidad moderada de manipulación', color: '#d97706', bar: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
    HIGH:     { text: 'Alta probabilidad de manipulación',     color: '#ea580c', bar: '#f97316', bg: '#fff7ed', border: '#fed7aa' },
    CRITICAL: { text: 'Manipulación digital casi confirmada',  color: '#dc2626', bar: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
};

// En ManipulationBar.jsx, agrega el prop y úsalo:
export default function ManipulationBar({ manipulationIndex, riskLevel, isInconclusive, forceMax }) {
    const [animated, setAnimated] = useState(0);

    useEffect(() => {
        const val = forceMax ? 100 : manipulationIndex;
        const timer = setTimeout(() => setAnimated(val), 100);
        return () => clearTimeout(timer);
    }, [manipulationIndex, forceMax]);

    const cfg = forceMax ? RISK_LABELS.CRITICAL : (RISK_LABELS[riskLevel] || RISK_LABELS.MEDIUM);

    return (
        <div className="manipulation-bar-box" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>

            {/* Etiqueta superior */}
            <div className="manipulation-bar-header">
                <span className="manipulation-bar-title">Índice de manipulación</span>
                <span className="manipulation-bar-pct" style={{ color: cfg.color }}>
        {isInconclusive ? '?' : forceMax ? '100%' : `${manipulationIndex}%`}
    </span>
            </div>

            {/* Barra */}
            <div className="manipulation-bar-track">
                <div
                    className="manipulation-bar-fill"
                    style={{
                        width: isInconclusive ? '100%' : `${animated}%`,
                        background: isInconclusive
                            ? 'repeating-linear-gradient(90deg, #fde68a 0px, #fde68a 8px, #fef3c7 8px, #fef3c7 16px)'
                            : cfg.bar,
                        transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                />
                {/* Marcadores de referencia */}
                <div className="manipulation-bar-markers">
                    <span style={{ left: '30%' }} />
                    <span style={{ left: '60%' }} />
                    <span style={{ left: '80%' }} />
                </div>
            </div>

            {/* Leyenda de zonas */}
            <div className="manipulation-bar-zones">
                <span style={{ color: '#16a34a' }}>Auténtico</span>
                <span style={{ color: '#d97706' }}>Sospechoso</span>
                <span style={{ color: '#ea580c' }}>Alto riesgo</span>
                <span style={{ color: '#dc2626' }}>Falso</span>
            </div>

            {/* Descripción en lenguaje simple */}
            <p className="manipulation-bar-desc" style={{ color: cfg.color }}>
                {isInconclusive
                    ? 'No fue posible determinar con certeza el nivel de manipulación.'
                    : forceMax
                        ? 'Manipulación confirmada — el contenido intentó evadir la detección.'
                        : cfg.text}
            </p>
        </div>
    );
}

