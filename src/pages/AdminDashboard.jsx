import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext.jsx';
import { getAdminStats } from '../services/api.js';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import '../styles/AdminDashboard.css';

// Barra de progreso simple para el gráfico de barras
function BarChart({ data, color = '#407FC2' }) {
    if (!data || data.length === 0) return <p className="admin-empty">Sin datos disponibles.</p>;
    const max = Math.max(...data.map(d => d.count), 1);
    return (
        <div className="bar-chart">
            {data.map((d, i) => (
                <div key={i} className="bar-item">
                    <div className="bar-track">
                        <div
                            className="bar-fill"
                            style={{ height: `${(d.count / max) * 100}%`, background: color }}
                            title={`${d._id}: ${d.count}`}
                        />
                    </div>
                    <span className="bar-label">{d._id?.slice(5) ?? d._id}</span>
                    <span className="bar-value">{d.count}</span>
                </div>
            ))}
        </div>
    );
}

// Grafico de torta simulado con barras horizontales
function HorizontalBars({ data }) {
    if (!data || data.length === 0) return <p className="admin-empty">Sin datos disponibles.</p>;
    const total = data.reduce((s, d) => s + d.count, 0) || 1;

    const COLOR = {
        AUTHENTIC:    '#16a34a',
        SUSPICIOUS:   '#7c3aed',
        MANIPULATED:  '#c0392b',
    };

    const LABEL = {
        AUTHENTIC:   'Autentico',
        SUSPICIOUS:  'Sospechoso',
        MANIPULATED: 'Manipulado',
    };

    return (
        <div className="hbar-chart">
            {data.map((d, i) => {
                const pct = Math.round((d.count / total) * 100);
                const key = d._id?.toUpperCase() ?? '';
                return (
                    <div key={i} className="hbar-row">
                        <span className="hbar-label">{LABEL[key] ?? d._id ?? 'Otro'}</span>
                        <div className="hbar-track">
                            <div
                                className="hbar-fill"
                                style={{ width: `${pct}%`, background: COLOR[key] ?? '#407FC2' }}
                            />
                        </div>
                        <span className="hbar-pct">{pct}% ({d.count})</span>
                    </div>
                );
            })}
        </div>
    );
}

export default function AdminDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user) return;
        if (user.role !== 'admin') {
            navigate('/home');
            return;
        }
        getAdminStats()
            .then(res => setStats(res.stats))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [user, navigate]);

    if (!user || user.role !== 'admin') return null;

    return (
        <div className="admin-page">
            <Navbar />
            <div className="admin-main">
                <div className="admin-header">
                    <h1 className="admin-title">Panel de administración</h1>
                    <p className="admin-subtitle">Resumen de actividad de la plataforma</p>
                </div>

                {loading && (
                    <div className="admin-loading">
                        <div className="admin-spinner" />
                        <p>Cargando estadísticas...</p>
                    </div>
                )}

                {error && (
                    <div className="admin-error-box">
                        <p>No se pudieron cargar las estadísticas: {error}</p>
                    </div>
                )}

                {stats && (
                    <>
                        {/* KPIs */}
                        <div className="admin-kpis">
                            <div className="kpi-card">
                                <span className="kpi-value">{stats.totalUsers}</span>
                                <span className="kpi-label">Usuarios registrados</span>
                            </div>
                            <div className="kpi-card accent">
                                <span className="kpi-value">{stats.activeToday}</span>
                                <span className="kpi-label">Activos hoy</span>
                            </div>
                            <div className="kpi-card">
                                <span className="kpi-value">{stats.activeLast7}</span>
                                <span className="kpi-label">Activos últimos 7 días</span>
                            </div>
                            <div className="kpi-card">
                                <span className="kpi-value">{stats.activeLast30}</span>
                                <span className="kpi-label">Activos últimos 30 días</span>
                            </div>
                        </div>

                        <div className="admin-charts">
                            {/* Analisis por dia */}
                            <div className="admin-chart-card wide">
                                <h2 className="chart-title">Análisis por día (últimos 7 días)</h2>
                                <BarChart data={stats.analysesByDay} color="#407FC2" />
                            </div>

                            {/* Distribución de resultados */}
                            <div className="admin-chart-card">
                                <h2 className="chart-title">Distribución de resultados (últimos 30 días)</h2>
                                <HorizontalBars data={stats.byResult} />
                            </div>

                            {/* Top streaks */}
                            <div className="admin-chart-card">
                                <h2 className="chart-title">Usuarios con mayor racha</h2>
                                {stats.topStreaks.length === 0 ? (
                                    <p className="admin-empty">Sin datos aún.</p>
                                ) : (
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Usuario</th>
                                                <th>Racha</th>
                                                <th>Total análisis</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats.topStreaks.map((u, i) => (
                                                <tr key={i}>
                                                    <td>{i + 1}</td>
                                                    <td>{u.name}</td>
                                                    <td><strong>{u.streak}</strong> días</td>
                                                    <td>{u.totalAnalyses}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
            <Footer />
        </div>
    );
}
