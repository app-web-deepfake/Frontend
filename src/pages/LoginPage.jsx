import React, { useState, useLayoutEffect, useRef } from "react";
import "../styles/login.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext.jsx";
import { authLogin } from "../services/api.js";

const montserratFont = document.createElement("link");
montserratFont.rel = "stylesheet";
montserratFont.href = "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap";
document.head.appendChild(montserratFont);

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [role, setRole] = useState("usuario");
    const btnRefs = useRef([]);
    const labelRefs = useRef([]);
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setError("");
        if (!email || !password) {
            setError("Completa todos los campos");
            return;
        }
        setLoading(true);
        try {
            const data = await authLogin({ email, password });
            login(data.user, data.token);
            navigate("/home");
        } catch (err) {
            setError(err.message || "Error al iniciar sesión");
        } finally {
            setLoading(false);
        }
    };

    const botones = [
        { label: "Usuario", value: "usuario" },
        { label: "Admin", value: "admin" },
    ];

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
        return () => { window.removeEventListener("resize", updateIndicator); if (rafId) window.cancelAnimationFrame(rafId); };
    }, [role]);

    return (
        <div className="login-bg">
            <div className="login-container">
                <h1 className="login-title">Bienvenido</h1>

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
                        <div style={{ color: "#e74c3c", fontSize: "13px", marginTop: "-8px", textAlign: "center" }}>
                            {error}
                        </div>
                    )}

                    <div className="login-forgot"><span>¿Olvidó su contraseña?</span></div>

                    <button className="login-btn-main" onClick={handleLogin} disabled={loading}>
                        {loading ? "Ingresando..." : "Iniciar Sesión"}
                    </button>

                    <button className="login-btn-facebook">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#fff">
                            <path d="M22.675 0h-21.35C.6 0 0 .6 0 1.326v21.348C0 23.4.6 24 1.326 24h11.495v-9.294H9.691v-3.622h3.13V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.92.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.4 24 24 23.4 24 22.674V1.326C24 .6 23.4 0 22.675 0" />
                        </svg>
                        <span>Iniciar Sesión con Facebook</span>
                    </button>

                    <div className="login-register">¿No tienes cuenta?<b> </b>
                        <a href="./register">Regístrate aquí</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
