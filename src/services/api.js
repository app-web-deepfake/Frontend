// api.js - Frontend
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

console.log("🌐 API URL configurada:", API_URL); // Para debug

// ✅ 1. OBTENER URL PRESIGNADA
export const getPresignedUrl = async (fileName, fileType) => {

    //console.log("📞 Pidiendo presigned URL para:", fileName, fileType);

    const response = await fetch(`${API_URL}/upload/upload-url`, {  // ✅ Ruta correcta
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileName, fileType }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error obteniendo URL de subida");
    }

    const data = await response.json();
    //console.log("✅ Presigned URL obtenida:", data);
    return data;
};

// ✅ 2. SUBIR ARCHIVO A S3
export const uploadToS3 = async (uploadUrl, fields, file) => {
    //console.log("📤 Subiendo archivo a S3...");

    const formData = new FormData();

    // Agregar todos los campos de autenticación primero
    Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value);
    });

    // Agregar el archivo AL FINAL
    formData.append("file", file);

    const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`Error subiendo a S3: ${response.statusText}`);
    }

    //console.log("✅ Archivo subido exitosamente a S3");
    return response;
};

// ✅ 3. INICIAR ANÁLISIS
export const startAnalysis = async (fileUrl) => {
    //console.log("🚀 Iniciando análisis para:", fileUrl);

    const response = await fetch(`${API_URL}/analysis/start`, {  // ✅ Ruta correcta
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileUrl }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error iniciando análisis");
    }

    const data = await response.json();
    //console.log("✅ Análisis iniciado:", data);
    return data;
};

// ✅ 4. OBTENER RESULTADO
export const getAnalysisResult = async (analysisId) => {
    //console.log("📊 Obteniendo resultado para:", analysisId);

    const response = await fetch(`${API_URL}/analysis/result`, {  // ✅ Ruta correcta
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ referenceId: analysisId }),  // ✅ Backend espera 'referenceId'
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error obteniendo resultado");
    }

    const data = await response.json();
    //console.log("✅ Resultado obtenido:", data);
    return data;
};

// ✅ 5. VERIFICAR ESTADO (Opcional)
export const checkAnalysisStatus = async (analysisId) => {
    //console.log("🔍 Verificando estado para:", analysisId);

    const response = await fetch(`${API_URL}/analysis/status/${analysisId}`, {  // ✅ GET request
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error verificando estado");
    }

    const data = await response.json();
    //console.log("✅ Estado:", data);
    return data;
};