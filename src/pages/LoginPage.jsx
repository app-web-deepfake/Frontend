import React, { useState, useLayoutEffect, useRef, useEffect } from "react";
import "../styles/login.css";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext.jsx";
import { authLogin } from "../services/api.js";

export default function LoginPage() {
    const navigate = useNavigate();
    const { login, isAuthenticated, loading } = useAuth();
    const [role, setRole] = useState("usuario");
    const btnRefs = useRef([]);
    const labelRefs = useRef([]);
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [showVerifyBanner, setShowVerifyBanner] = useState(false);
    const [sessionExpired, setSessionExpired] = useState(false);

    useEffect(() => {
        if (window.location.search.includes("session=expired")) {
            setSessionExpired(true);
        }
    }, []);

    // ✅ useLayoutEffect ANTES del early return
    useLayoutEffect(() => {
        let rafId = null;
        function updateIndicator() {
            const index = role === "usuario" ? 0 : 1;
            const el = btnRefs.current[index];
            if (!el) { rafId = window.requestAnimationFrame(updateIndicator); return; }
            const parent = el.parentElement;
            const labelEl = labelRefs.current[index] || el;
            if (parent) {
                const parentRect = parent.getBoundingClientRect();
                const elRect = (labelEl && labelEl.getBoundingClientRect()) || el.getBoundingClientRect();
                setIndicatorStyle({ left: elRect.left - parentRect.left, width: elRect.width });
            } else {
                setIndicatorStyle({ left: el.offsetLeft, width: el.offsetWidth });
            }
        }
        updateIndicator();
        window.addEventListener("resize", updateIndicator);
        return () => {
            window.removeEventListener("resize", updateIndicator);
            if (rafId) window.cancelAnimationFrame(rafId);
        };
    }, [role]);

    // ✅ Early return DESPUÉS de todos los hooks
    if (!loading && isAuthenticated) {
        return <Navigate to="/home" replace />;
    }

    const handleLogin = async () => {
        setError("");
        if (!email || !password) {
            setError("Completa todos los campos");
            return;
        }
        setSubmitting(true);
        try {
            const data = await authLogin({ email, password });

            // La pestaña elegida (Usuario/Admin) debe coincidir con el rol real de la cuenta
            if (role !== data.user.role) {
                const mensaje = role === "admin"
                    ? "Esta cuenta no tiene permisos de administrador."
                    : "Esta es una cuenta de administrador. Selecciona la pestaña \"Admin\" para iniciar sesión.";
                setError(mensaje);
                setSubmitting(false);
                return;
            }

            login(data.user, data.token);

            const destination = data.user.role === "admin" ? "/admin" : "/home";

            if (data.emailVerified === false) {
                setShowVerifyBanner(true);
                setTimeout(() => navigate(destination), 2000);
            } else {
                navigate(destination);
            }
        } catch (err) {
            setError(err.message || "Error al iniciar sesión");
        } finally {
            setSubmitting(false);
        }
    };

    const botones = [
        { label: "Usuario", value: "usuario" },
        { label: "Admin", value: "admin" },
    ];

    return (
        <div className="login-bg">
            <div className="login-container">
                <h1 className="login-title">Bienvenido</h1>

                {sessionExpired && (
                    <div style={{ background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: "8px", padding: "10px 14px", marginBottom: "12px", color: "#92400e", fontSize: "13px", textAlign: "center" }}>
                        Tu sesión ha expirado. Por favor inicia sesión de nuevo.
                    </div>
                )}

                {showVerifyBanner && (
                    <div style={{ background: "#eff6ff", border: "1px solid #93c5fd", borderRadius: "8px", padding: "10px 14px", marginBottom: "12px", color: "#1d4ed8", fontSize: "13px", textAlign: "center" }}>
                        Revisa tu correo para verificar tu cuenta. <small>(Puedes usar la app mientras tanto)</small>
                    </div>
                )}

                <div className="login-options">
                    <div className="login-buttons-row">
                        {botones.map((btn, i) => (
                            <button
                                key={btn.value}
                                ref={(el) => (btnRefs.current[i] = el)}
                                onClick={() => setRole(btn.value)}
                                className={`login-btn-select${role === btn.value ? " selected" : ""}`}
                            >
                                <span ref={(el) => (labelRefs.current[i] = el)} className="login-btn-label">
                                    {btn.label}
                                </span>
                            </button>
                        ))}
                        <div
                            className="login-underline"
                            style={{ left: indicatorStyle.left + "px", width: indicatorStyle.width + "px" }}
                        />
                    </div>

                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        className="login-input"
                        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Contraseña"
                        className="login-input"
                        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    />

                    {error && (
                        <div className="auth-error" role="alert">
                            {error}
                        </div>
                    )}

                    <div className="login-forgot">
                        <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
                    </div>

                    <button className="login-btn-main" onClick={handleLogin} disabled={submitting}>
                        {submitting ? "Ingresando..." : "Iniciar Sesión"}
                    </button>

                    <div className="login-register">¿No tienes cuenta?<b> </b>
                        <Link to="/register">Regístrate aquí</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}