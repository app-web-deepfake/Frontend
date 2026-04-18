import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { useAuth } from '../context/authContext.jsx';
import { getHistorial } from '../services/api.js';
import '../styles/Historial.css';

export default function Historial() {
    const navigate = useNavigate();
    const { token, user, isAuthenticated } = useAuth();
    const [analisis, setAnalisis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagina, setPagina] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/');
            return;
        }
        cargarHistorial(pagina);
    }, [isAuthenticated, pagina]);

    const cargarHistorial = async (p) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getHistorial(token, p);
            setAnalisis(data.data || []);
            setTotalPaginas(data.pagination?.totalPages || 1);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatearFecha = (fechaStr) => {
        const fecha = new Date(fechaStr);
        return fecha.toLocaleDateString('es-ES', {
            day: '2-digit', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getVeredictoBadge = (item) => {
        if (item.verdict === 'processing') return { label: 'Procesando', clase: 'badge-processing' };
        if (item.isDeepfake) return { label: 'Falso', clase: 'badge-fake' };
        return { label: 'Auténtico', clase: 'badge-real' };
    };

    return (
        <div className="historial-page">
            <Navbar />

            <div className="historial-main">
                <div className="historial-header">
                    <h1 className="historial-title">📋 Mi Historial</h1>
                    <p className="historial-subtitle">
                        Aquí puedes ver todos los análisis que has realizado anteriormente.
                    </p>
                </div>

                {loading && (
                    <div className="historial-loading">
                        <div className="spinner-grande"></div>
                        <p>Cargando tu historial...</p>
                    </div>
                )}

                {error && (
                    <div className="historial-error">
                        <span>⚠️</span>
                        <p>{error}</p>
                        <button className="btn-reintentar" onClick={() => cargarHistorial(pagina)}>
                            Reintentar
                        </button>
                    </div>
                )}

                {!loading && !error && analisis.length === 0 && (
                    <div className="historial-vacio">
                        <div className="vacio-icono">🔍</div>
                        <h2>Aún no tienes análisis guardados</h2>
                        <p>Cuando analices una imagen o video, aparecerá aquí para que puedas consultarlo después.</p>
                        <button className="btn-analizar" onClick={() => navigate('/home')}>
                            Hacer mi primer análisis
                        </button>
                    </div>
                )}

                {!loading && !error && analisis.length > 0 && (
                    <>
                        <div className="historial-contador">
                            <strong>{analisis.length}</strong> análisis en esta página
                        </div>

                        <div className="historial-lista">
                            {analisis.map((item, idx) => {
                                const badge = getVeredictoBadge(item);
                                return (
                                    <div key={item._id || idx} className="historial-card">
                                        {/* Miniatura / ícono */}
                                        <div className="card-icono">
                                            {item.fileUrl ? (
                                                <img
                                                    src={item.fileUrl}
                                                    alt="Archivo analizado"
                                                    className="card-miniatura"
                                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                                />
                                            ) : null}
                                            <div className="card-icono-fallback" style={{ display: item.fileUrl ? 'none' : 'flex' }}>
                                                📷
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div className="card-info">
                                            <div className="card-top">
                                                <span className={`badge ${badge.clase}`}>
                                                    {badge.label}
                                                </span>
                                                <span className="card-fecha">
                                                    {formatearFecha(item.createdAt)}
                                                </span>
                                            </div>

                                            {item.fileName && (
                                                <p className="card-nombre">📁 {item.fileName}</p>
                                            )}

                                            <div className="card-detalles">
                                                {item.confidence && (
                                                    <span className="detalle-chip">
                                                        Confianza: <strong>{item.confidence}%</strong>
                                                    </span>
                                                )}
                                                {item.faciaReferenceId && (
                                                    <span className="detalle-chip">
                                                        ID: <code>{item.faciaReferenceId.slice(0, 12)}...</code>
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Acción */}
                                        {item.faciaReferenceId && (
                                            <button
                                                className="card-btn-ver"
                                                onClick={() => navigate(`/result/${item.faciaReferenceId}`)}
                                            >
                                                Ver resultado →
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Paginación */}
                        {totalPaginas > 1 && (
                            <div className="historial-paginacion">
                                <button
                                    className="btn-pagina"
                                    disabled={pagina === 1}
                                    onClick={() => setPagina(p => p - 1)}
                                >
                                    ← Anterior
                                </button>
                                <span className="pagina-info">
                                    Página <strong>{pagina}</strong> de <strong>{totalPaginas}</strong>
                                </span>
                                <button
                                    className="btn-pagina"
                                    disabled={pagina === totalPaginas}
                                    onClick={() => setPagina(p => p + 1)}
                                >
                                    Siguiente →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
