import React, { useEffect, useState } from 'react';
import { getStreak } from '../services/api.js';
import '../styles/StreakBadge.css';

const MILESTONES = [3, 7, 14, 30, 60, 100];

function getMilestoneLabel(streak) {
    if (streak >= 100) return '100 dias consecutivos';
    if (streak >= 60)  return '60 dias consecutivos';
    if (streak >= 30)  return 'Un mes de racha';
    if (streak >= 14)  return '2 semanas seguidas';
    if (streak >= 7)   return 'Una semana completa';
    if (streak >= 3)   return '3 dias seguidos';
    return null;
}

// Icono llama SVG sin emoji
const FlameIcon = ({ size = 18, active = false }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? '#f97316' : 'none'}
         stroke={active ? '#f97316' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 3z"/>
    </svg>
);

const TrophyIcon = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 010-5H6"/><path d="M18 9h1.5a2.5 2.5 0 000-5H18"/>
        <path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
        <path d="M18 2H6v7a6 6 0 0012 0V2z"/>
    </svg>
);

export default function StreakBadge({ compact = false }) {
    const [streak, setStreak] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getStreak()
            .then(res => setStreak(res.streak))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading || !streak) return null;

    const label = getMilestoneLabel(streak.current);
    const isActive = streak.current > 0;

    if (compact) {
        return (
            <div className={`streak-badge-compact ${isActive ? 'active' : ''}`}
                 title={`Racha actual: ${streak.current} dia${streak.current !== 1 ? 's' : ''}`}>
                <FlameIcon size={13} active={isActive} />
                <span className={`streak-number ${isActive ? 'active' : 'zero'}`}>{streak.current}</span>
            </div>
        );
    }

    return (
        <div className="streak-card">
            <div className="streak-card-header">
                <FlameIcon size={20} active={isActive} />
                <span className="streak-card-title">Racha diaria</span>
            </div>

            <div className="streak-stats">
                <div className="streak-stat main">
                    <span className={`streak-stat-value ${isActive ? 'fire' : ''}`}>{streak.current}</span>
                    <span className="streak-stat-label">dias seguidos</span>
                </div>
                <div className="streak-divider" />
                <div className="streak-stat">
                    <TrophyIcon size={13} />
                    <span className="streak-stat-value small">{streak.max}</span>
                    <span className="streak-stat-label">record</span>
                </div>
                <div className="streak-divider" />
                <div className="streak-stat">
                    <span className="streak-stat-value small">{streak.todayAnalyses ?? (streak.analyzedToday ? 1 : 0)}</span>
                    <span className="streak-stat-label">hoy</span>
                </div>
            </div>

            {label && <div className="streak-milestone-badge">{label}</div>}

            {streak.analyzedToday ? (
                <p className="streak-checkin-msg ok">Analizaste contenido hoy — racha guardada</p>
            ) : (
                <p className="streak-checkin-msg pending">
                    Analiza una imagen o video hoy para {streak.current > 0 ? 'mantener tu racha' : 'iniciar tu racha'}
                </p>
            )}

            <div className="streak-progress">
                {MILESTONES.map((m) => (
                    <div key={m} className={`streak-milestone ${streak.current >= m ? 'reached' : ''}`} title={`Meta: ${m} dias`}>
                        {m}
                    </div>
                ))}
            </div>
        </div>
    );
}
