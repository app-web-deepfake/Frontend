import React, { useEffect, useState } from 'react';
import { getLeaderboard } from '../services/api.js';
import { IconFlame, IconTrophy } from './Icons.jsx';
import { useAuth } from '../context/authContext.jsx';
import '../styles/Leaderboard.css';

const MEDAL = ['🥇', '🥈', '🥉'];

export default function Leaderboard() {
    const [board, setBoard] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        getLeaderboard()
            .then(res => setBoard(res.leaderboard || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="leaderboard-card">
                <div className="leaderboard-header">
                    <IconTrophy size={18} color="#f59e0b" />
                    <span className="leaderboard-title">Ranking de rachas</span>
                </div>
                <div className="leaderboard-skeleton">
                    {[1,2,3].map(i => <div key={i} className="lb-skeleton-row" />)}
                </div>
            </div>
        );
    }

    if (board.length === 0) {
        return (
            <div className="leaderboard-card">
                <div className="leaderboard-header">
                    <IconTrophy size={18} color="#f59e0b" />
                    <span className="leaderboard-title">Ranking de rachas</span>
                </div>
                <p className="leaderboard-empty">
                    Sé el primero en aparecer aquí — analiza un contenido hoy 🔥
                </p>
            </div>
        );
    }

    return (
        <div className="leaderboard-card">
            <div className="leaderboard-header">
                <IconTrophy size={18} color="#f59e0b" />
                <span className="leaderboard-title">Ranking de rachas</span>
                <span className="leaderboard-subtitle">Usuarios más constantes</span>
            </div>

            <ol className="leaderboard-list">
                {board.map((entry, i) => {
                    const isMe = user?.name && entry.name === user.name;
                    return (
                        <li key={i} className={`lb-row ${isMe ? 'is-me' : ''} ${i < 3 ? 'top-three' : ''}`}>
                            <span className="lb-rank">
                                {i < 3 ? MEDAL[i] : <span className="lb-rank-num">{entry.rank}</span>}
                            </span>
                            <span className="lb-name">
                                {entry.name.split(' ')[0]}
                                {isMe && <span className="lb-you-tag">tú</span>}
                            </span>
                            <span className="lb-streak">
                                <IconFlame size={13} color="#f97316" filled />
                                <strong>{entry.streak}</strong>
                                <span className="lb-streak-label">días</span>
                            </span>
                        </li>
                    );
                })}
            </ol>

            <p className="leaderboard-hint">
                La racha se gana analizando al menos un contenido por día
            </p>
        </div>
    );
}
