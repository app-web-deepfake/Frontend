import React, { useEffect, useState } from 'react';
import { getStreak } from '../services/api.js';
import { IconFlame, IconTrophy } from './Icons.jsx';
import '../styles/StreakBadge.css';

const MILESTONES = [3, 7, 14, 30, 60, 100];

function getMilestoneLabel(streak) {
    if (streak >= 100) return '🏆 ¡100 días!';
    if (streak >= 60)  return '💎 60 días';
    if (streak >= 30)  return '🌟 1 mes';
    if (streak >= 14)  return '🔥 2 semanas';
    if (streak >= 7)   return '⚡ 1 semana';
    if (streak >= 3)   return '✨ 3 días seguidos';
    return null;
}

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
            <div
                className={`streak-badge-compact ${isActive ? 'active' : ''}`}
                title={`Racha actual: ${streak.current} día${streak.current !== 1 ? 's' : ''}`}
            >
                <IconFlame size={14} color={isActive ? '#f97316' : '#9ca3af'} filled={isActive} />
                <span className={`streak-number ${isActive ? 'active' : 'zero'}`}>
                    {streak.current}
                </span>
            </div>
        );
    }

    return (
        <div className="streak-card">
            <div className="streak-card-header">
                <IconFlame size={22} color={isActive ? '#f97316' : '#9ca3af'} filled={isActive} />
                <span className="streak-card-title">Tu racha diaria</span>
            </div>

            <div className="streak-stats">
                <div className="streak-stat main">
                    <span className={`streak-stat-value ${isActive ? 'fire' : ''}`}>
                        {streak.current}
                    </span>
                    <span className="streak-stat-label">días seguidos</span>
                </div>
                <div className="streak-divider" />
                <div className="streak-stat">
                    <IconTrophy size={14} color="#f59e0b" />
                    <span className="streak-stat-value small">{streak.max}</span>
                    <span className="streak-stat-label">récord</span>
                </div>
                <div className="streak-divider" />
                <div className="streak-stat">
                    <span className="streak-stat-value small">{streak.totalAnalyses}</span>
                    <span className="streak-stat-label">análisis</span>
                </div>
            </div>

            {label && (
                <div className="streak-milestone-badge">{label}</div>
            )}

            {streak.analyzedToday ? (
                <p className="streak-checkin-msg ok">✓ Ya analizaste contenido hoy — racha guardada</p>
            ) : (
                <p className="streak-checkin-msg pending">
                    Analiza una imagen o video hoy para {streak.current > 0 ? 'mantener tu racha' : 'iniciar tu racha'}
                </p>
            )}

            <div className="streak-progress">
                {MILESTONES.map((m) => (
                    <div
                        key={m}
                        className={`streak-milestone ${streak.current >= m ? 'reached' : ''}`}
                        title={`Meta: ${m} días`}
                    >
                        {m}
                    </div>
                ))}
            </div>
        </div>
    );
}
