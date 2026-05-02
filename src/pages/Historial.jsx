import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { useAuth } from '../context/authContext.jsx';
import { getHistorial } from '../services/api.js';
import { IconFile, IconImage } from '../components/Icons.jsx';
import '../styles/Historial.css';

function SkeletonCard() {
    return (
        <div className="historial-card skeleton-card">
            <div className="skeleton skeleton-thumb" />
            <div className="skeleton-info">
                <div className="skeleton skeleton-badge" />
                <div className="skeleton skeleton-line" />
                <div className="skeleton skeleton-line short" />
            </div>
            <div className="skeleton skeleton-btn" />
        </div>
    );
}

export default function Historial() {
    const navigate = useNavigate();
    const { token, isAuthenticated } = useAuth();
    const [analisis, setAnalisis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagina, setPagina] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [filtroVeredicto, setFiltroVeredicto] = useState('todos');
    const [filtroFecha, setFiltroFecha] = useState('recientes');

    useEffect(() => {
        if (!isAuthenticated) { navigate('/'); return; }
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
        return { label: 'Autentico', clase: 'badge-real' };
    };

    const analisisFiltrado = useMemo(() => {
        let lista = [...analisis];
        if (filtroVeredicto === 'autentico') lista = lista.filter(i => !i.isDeepfake && i.verdict !== 'processing');
        else if (filtroVeredicto === 'falso') lista = lista.filter(i => i.isDeepfake);
        else if (filtroVeredicto === 'procesando') lista = lista.filter(i => i.verdict === 'processing');
        if (filtroFecha === 'recientes') lista.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        else lista.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        return lista;
    }, [analisis, filtroVeredicto, filtroFecha]);

    return (
        <div className="historial-page">
            <Navbar />
            <div className="historial-main">
                <div className="historial-header">
                    <h1 className="historial-title">Mi Historial</h1>
                    <p className="historial-subtitle">Aqui puedes ver todos los analisis que has realizado.</p>
                </div>

                {/* Filtros */}
                {!loading && !error && analisis.length > 0 && (
                    <div className="historial-filtros">
                        <div className="filtro-grupo">
                            <label className="filtro-label">Resultado</label>
                            <select className="filtro-select" value={filtroVeredicto} onChange={e => setFiltroVeredicto(e.target.value)}>
                                <option value="todos">Todos</option>
                                <option value="autentico">Autentico</option>
                                <option value="falso">Falso</option>
                                <option value="procesando">Procesando</option>
                            </select>
                        </div>
                        <div className="filtro-grupo">
                            <label className="filtro-label">Orden</label>
                            <select className="filtro-select" value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)}>
                                <option value="recientes">Mas recientes</option>
                                <option value="antiguos">Mas antiguos</option>
                            </select>
                        </div>
                        <span className="historial-contador">
                            {analisisFiltrado.length} de {analisis.length} analisis
                        </span>
                    </div>
                )}

                {/* Skeleton */}
                {loading && (
                    <div className="historial-lista">
                        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <div className="historial-error">
                        <p>{error}</p>
                        <button className="btn-reintentar" onClick={() => cargarHistorial(pagina)}>Reintentar</button>
                    </div>
                )}

                {/* Vacio */}
                {!loading && !error && analisis.length === 0 && (
                    <div className="historial-vacio">
                        <h2>Aun no tienes analisis guardados</h2>
                        <p>Cuando analices una imagen o video, aparecera aqui para que puedas consultarlo despues.</p>
                        <button className="btn-analizar" onClick={() => navigate('/home')}>Hacer mi primer analisis</button>
                    </div>
                )}

                {/* Sin resultados con filtro */}
                {!loading && !error && analisis.length > 0 && analisisFiltrado.length === 0 && (
                    <div className="historial-vacio">
                        <h2>Ningun analisis coincide con los filtros</h2>
                        <p>Prueba con otras opciones.</p>
                        <button className="btn-analizar" onClick={() => { setFiltroVeredicto('todos'); setFiltroFecha('recientes'); }}>
                            Limpiar filtros
                        </button>
                    </div>
                )}

                {/* Lista */}
                {!loading && !error && analisisFiltrado.length > 0 && (
                    <div className="historial-lista">
                        {analisisFiltrado.map((item, i) => {
                            const badge = getVeredictoBadge(item);
                            return (
                                <div key={item._id || i} className="historial-card">
                                    <div className="card-icono">
                                        {item.fileUrl ? (
                                            <>
                                                <img
                                                    src={item.fileUrl}
                                                    alt="Archivo analizado"
                                                    className="card-miniatura"
                                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                                />
                                                <div className="card-icono-fallback" style={{ display: 'none' }}>
                                                    <IconImage size={28} color="#94a3b8" />
                                                </div>
                                            </>
                                        ) : (
                                            <div className="card-icono-fallback">
                                                <IconImage size={28} color="#94a3b8" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="card-info">
                                        <div className="card-top">
                                            <span className={`badge ${badge.clase}`}>{badge.label}</span>
                                            <span className="card-fecha">{formatearFecha(item.createdAt)}</span>
                                        </div>
                                        {item.fileName && (
                                            <p className="card-nombre">
                                                <IconFile size={14} color="#64748b" />
                                                {item.fileName}
                                            </p>
                                        )}
                                        <div className="card-detalles">
                                            {item.confidence != null && (
                                                <span className="detalle-chip">Confianza: <code>{item.confidence}%</code></span>
                                            )}
                                            {item.faciaReferenceId && (
                                                <span className="detalle-chip">ID: <code>{item.faciaReferenceId.slice(0, 12)}...</code></span>
                                            )}
                                        </div>
                                    </div>

                                    <button className="card-btn-ver" onClick={() => navigate(`/result/${item.faciaReferenceId}`)}>
                                        Ver resultado
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Paginacion */}
                {!loading && totalPaginas > 1 && (
                    <div className="historial-paginacion">
                        <button className="btn-pagina" onClick={() => setPagina(p => p - 1)} disabled={pagina === 1}>Anterior</button>
                        <span className="pagina-info">Pagina {pagina} de {totalPaginas}</span>
                        <button className="btn-pagina" onClick={() => setPagina(p => p + 1)} disabled={pagina === totalPaginas}>Siguiente</button>
                    </div>
                )}
            </div>
        </div>
    );
}