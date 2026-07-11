import React, { useEffect, useState } from 'react';

/**
 * ManipulationBar v2
 * Props:
 *  - manipulationIndex: number (0–100)
 *  - riskLevel: "LOW" | "MEDIUM" | "SUSPICIOUS" | "HIGH" | "CRITICAL"
 *  - isInconclusive: boolean
 *  - forceMax: boolean
 */

const RISK_LABELS = {
    LOW:        { text: 'Muy baja probabilidad de manipulación',  color: '#16a34a', bar: '#22c55e', bg: '#f0fdf4', border: '#bbf7d0' },
    MEDIUM:     { text: 'Probabilidad moderada de manipulación',  color: '#d97706', bar: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
    SUSPICIOUS: { text: 'Resultado no concluyente',               color: '#7c3aed', bar: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe' },
    HIGH:       { text: 'Alta probabilidad de manipulación',      color: '#ea580c', bar: '#f97316', bg: '#fff7ed', border: '#fed7aa' },
    CRITICAL:   { text: 'Manipulación digital casi confirmada',   color: '#dc2626', bar: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
};

export default function ManipulationBar({ manipulationIndex, riskLevel, isInconclusive, forceMax }) {
    const [animated, setAnimated] = useState(0);

    useEffect(() => {
        // Pequeño delay para que la animación arranque después del render
        const timer = setTimeout(() => {
            setAnimated(forceMax ? 100 : (manipulationIndex ?? 0));
        }, 150);
        return () => clearTimeout(timer);
    }, [manipulationIndex, forceMax]);

    const cfg = forceMax
        ? RISK_LABELS.CRITICAL
        : (RISK_LABELS[riskLevel] || RISK_LABELS.MEDIUM);

    // Para SUSPICIOUS mostramos la barra al valor real pero con patrón rayado
    const isSuspicious = riskLevel === 'SUSPICIOUS' && !forceMax;

    const barStyle = {
        width: isInconclusive && !isSuspicious
            ? '100%'
            : `${animated}%`,
        background: isInconclusive && !isSuspicious
            ? 'repeating-linear-gradient(90deg, #fde68a 0px, #fde68a 8px, #fef3c7 8px, #fef3c7 16px)'
            : isSuspicious
                ? `repeating-linear-gradient(90deg, #8b5cf6 0px, #8b5cf6 8px, #c4b5fd 8px, #c4b5fd 16px)`
                : cfg.bar,
        transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        minWidth: animated > 0 || isInconclusive ? '4px' : '0',
    };

    const displayPct = forceMax ? '100%' : (isInconclusive && !isSuspicious) ? '?' : `${manipulationIndex ?? 0}%`;

    return (
        <div
            className="manipulation-bar-box"
            style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
        >
            {/* Encabezado */}
            <div className="manipulation-bar-header">
                <span className="manipulation-bar-title">Índice de manipulación</span>
                <span className="manipulation-bar-pct" style={{ color: cfg.color }}>
                    {displayPct}
                </span>
            </div>

            {/* Barra */}
            <div className="manipulation-bar-track">
                <div className="manipulation-bar-fill" style={barStyle} />
                <div className="manipulation-bar-markers">
                    <span style={{ left: '30%' }} />
                    <span style={{ left: '60%' }} />
                    <span style={{ left: '80%' }} />
                </div>
            </div>

            {/* Leyenda de zonas */}
            <div className="manipulation-bar-zones">
                <span style={{ color: '#16a34a' }}>Auténtico</span>
                <span style={{ color: '#7c3aed' }}>Sospechoso</span>
                <span style={{ color: '#ea580c' }}>Alto riesgo</span>
                <span style={{ color: '#dc2626' }}>Falso</span>
            </div>

            {/* Descripción */}
            <p className="manipulation-bar-desc" style={{ color: cfg.color }}>
                {forceMax
                    ? 'Manipulación confirmada — el contenido intentó evadir la detección.'
                    : isInconclusive && !isSuspicious
                        ? 'No fue posible determinar con certeza el nivel de manipulación.'
                        : cfg.text}
            </p>
        </div>
    );
}