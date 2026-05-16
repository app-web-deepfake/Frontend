const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// Global 401 handler — redirect to login if session expired
const handleResponse = async (response) => {
    if (response.status === 401) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        window.location.href = "/?session=expired";
        throw new Error("Sesión expirada. Por favor inicia sesión de nuevo.");
    }
    return response;
};

// Helper: cabeceras con JWT desde localStorage
const authHeaders = (extra = {}) => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
        localStorage.removeItem("auth_user");
        window.location.href = "/?session=expired";
        throw new Error("No hay sesión activa. Por favor inicia sesión.");
    }
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        ...extra,
    };
};

// 1. OBTENER URL PRESIGNADA
export const getPresignedUrl = async (fileName, fileType) => {
    const response = await handleResponse(
        await fetch(`${API_URL}/upload/upload-url`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ fileName, fileType }),
        })
    );
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error obteniendo URL de subida");
    }
    return response.json();
};

// 2. SUBIR ARCHIVO A S3 (va directo a S3, sin auth del backend)
export const uploadToS3 = async (uploadUrl, fields, file) => {
    const formData = new FormData();
    Object.entries(fields).forEach(([key, value]) => formData.append(key, value));
    formData.append("file", file);
    const response = await fetch(uploadUrl, { method: "POST", body: formData });
    if (!response.ok) throw new Error(`Error subiendo a S3: ${response.statusText}`);
    return response;
};

// 3. INICIAR ANÁLISIS
export const startAnalysis = async (fileUrl, fileName) => {
    const response = await handleResponse(
        await fetch(`${API_URL}/analysis/start`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ fileUrl, fileName: fileName || null }),
        })
    );
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error iniciando análisis");
    }
    return response.json();
};

// 4. OBTENER RESULTADO
export const getAnalysisResult = async (analysisId) => {
    const response = await handleResponse(
        await fetch(`${API_URL}/analysis/result`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ referenceId: analysisId }),
        })
    );
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error obteniendo resultado");
    }
    return response.json();
};

// 5. VERIFICAR ESTADO
export const checkAnalysisStatus = async (analysisId) => {
    const response = await handleResponse(
        await fetch(`${API_URL}/analysis/status/${analysisId}`, {
            method: "GET",
            headers: authHeaders(),
        })
    );
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error verificando estado");
    }
    return response.json();
};

// ─── AUTH (públicos) ──────────────────────────────────────────────────────

export const authRegister = async ({ name, email, password }) => {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Error al registrar");
    return data;
};

export const authLogin = async ({ email, password }) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Error al iniciar sesión");
    return data;
};

export const forgotPassword = async (email) => {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Error procesando solicitud");
    return data;
};

export const resetPassword = async (token, password) => {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Error restableciendo contraseña");
    return data;
};

export const verifyEmailToken = async (token) => {
    const response = await fetch(`${API_URL}/auth/verify-email/${token}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Error verificando email");
    return data;
};

// ─── AUTH (protegidos) ────────────────────────────────────────────────────

export const changePassword = async (currentPassword, newPassword) => {
    const response = await handleResponse(
        await fetch(`${API_URL}/auth/change-password`, {
            method: "PUT",
            headers: authHeaders(),
            body: JSON.stringify({ currentPassword, newPassword }),
        })
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Error cambiando contraseña");
    return data;
};

// ─── HISTORIAL ────────────────────────────────────────────────────────────

export const getHistorial = async (token, page = 1) => {
    const response = await fetch(`${API_URL}/historial?page=${page}&limit=10`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Error obteniendo historial");
    return data;
};

export const deleteAnalysis = async (id) => {
    const response = await handleResponse(
        await fetch(`${API_URL}/historial/${id}`, {
            method: "DELETE",
            headers: authHeaders(),
        })
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Error eliminando registro");
    return data;
};

export const updateProfile = async ({ name, email }) => {
    const response = await handleResponse(
        await fetch(`${API_URL}/auth/profile`, {
            method: "PUT",
            headers: authHeaders(),
            body: JSON.stringify({ name, email }),
        })
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Error actualizando perfil");
    return data;
};

export const getMe = async () => {
    const response = await handleResponse(
        await fetch(`${API_URL}/auth/me`, {
            method: "GET",
            headers: authHeaders(),
        })
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Error obteniendo perfil");
    return data;
};

export const resendVerification = async () => {
    const response = await handleResponse(
        await fetch(`${API_URL}/auth/resend-verification`, {
            method: "POST",
            headers: authHeaders(),
        })
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Error reenviando verificación");
    return data;
};

export const sendSuggestion = async (message) => {
    const response = await handleResponse(
        await fetch(`${API_URL}/auth/suggestion`, {
            method: "POST",
            headers: { ...authHeaders(), "Content-Type": "application/json" },
            body: JSON.stringify({ message }),
        })
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Error enviando mensaje");
    return data;
};

export const deleteAllAnalysis = async () => {
    const response = await handleResponse(
        await fetch(`${API_URL}/historial`, {
            method: "DELETE",
            headers: authHeaders(),
        })
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Error eliminando historial");
    return data;
};
// feedback
export const submitAnalysisFeedback = async (referenceId, { userAgreement, userVerdict, userComment }) => {
    const response = await handleResponse(
        await fetch(`${API_URL}/analysis/${referenceId}/feedback`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ userAgreement, userVerdict, userComment }),
        })
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Error enviando feedback");
    return data;
};