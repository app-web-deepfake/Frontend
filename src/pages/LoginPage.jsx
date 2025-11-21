import React, { useState, useLayoutEffect, useRef } from "react";
import "../styles/login.css";
import {useNavigate} from "react-router-dom";

// ✅ Cargar fuente Montserrat
const montserratFont = document.createElement("link");
montserratFont.rel = "stylesheet";
montserratFont.href =
  "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap";
document.head.appendChild(montserratFont);

export default function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState("usuario");
  const btnRefs = useRef([]);
  const labelRefs = useRef([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    const userData = { email, role };
    console.log("Usuario autenticado:", userData);
    // Aquí podrías redirigir o guardar token
      navigate("/home");
  };

  const botones = [
    { label: "Usuario", value: "usuario" },
    { label: "Admin", value: "admin" },
  ];

  // Use layout effect so we measure after DOM mutations but before paint
  useLayoutEffect(() => {
    let rafId = null;

    function updateIndicator() {
      const index = role === "usuario" ? 0 : 1;
      const el = btnRefs.current[index];
      // btnRefs might not be populated immediately; guard and retry once
      if (!el) {
        // try again on next frame
        rafId = window.requestAnimationFrame(updateIndicator);
        return;
      }
      // Use getBoundingClientRect relative to parent to avoid offsetParent edge-cases
      const parent = el.parentElement;
      const labelEl = labelRefs.current[index] || el;
      if (parent) {
        const parentRect = parent.getBoundingClientRect();
        const elRect = (labelEl && labelEl.getBoundingClientRect()) || el.getBoundingClientRect();
        const left = elRect.left - parentRect.left;
        const width = elRect.width;
        setIndicatorStyle({ left, width });
      } else {
        // fallback
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

  return (
    <div className="login-bg">
      <div className="login-container">
        <h1 className="login-title">Bienvenido</h1>

        {/* Botones de selección */}
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

          {/* Inputs */}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="login-input"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="login-input"
          />

          <div className="login-forgot">
            <span>¿Olvidó su contraseña?</span>
          </div>

          {/* Botones principales */}
          <button className="login-btn-main" onClick={handleLogin}>
            Iniciar Sesión
          </button>

          <button className="login-btn-facebook">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="#fff"
            >
              <path d="M22.675 0h-21.35C.6 0 0 .6 0 1.326v21.348C0 23.4.6 24 1.326 24h11.495v-9.294H9.691v-3.622h3.13V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.92.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.4 24 24 23.4 24 22.674V1.326C24 .6 23.4 0 22.675 0" />
            </svg>
            <span>Iniciar Sesión con Facebook</span>
          </button>

          <div className="login-register">¿No tienes cuenta?<b> </b>
              <a href="./register">Registrate aquí</a>
          </div>
        </div>
      </div>
    </div>
  );
}
