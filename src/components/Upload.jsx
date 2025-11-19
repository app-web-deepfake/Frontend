// src/components/Upload.jsx
import React, { useState, useRef } from 'react';
import '../styles/Upload.css';
import {getPresignedUrl, uploadToS3, startAnalysis} from '../services/api';
import { useNavigate } from "react-router-dom";

const MAX_FILE_SIZE = 60 * 1024 * 1024; // 60MB max
const ALLOWED_TYPES = [
    'image/jpeg', 'image/jpg', 'image/png',
    'video/mp4'
];

export default function Upload({ onClose }) {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);
    const inputRef = useRef();

    const validateFile = (f) => {
        if (!f) return 'No file';
        if (!ALLOWED_TYPES.includes(f.type)) return 'Tipo no permitido. Usa .jpeg .jpg .png o .mp4';
        if (f.size > MAX_FILE_SIZE) return `Archivo muy grande. Máx ${(MAX_FILE_SIZE / (1024*1024)).toFixed(0)}MB`;
        return null;
    };

    const handleFileChange = (e) => {
        setError('');
        const f = e.target.files[0];
        const err = validateFile(f);
        if (err) {
            setFile(null);
            setError(err);
            return;
        }
        setFile(f);
    };

    const triggerFileSelect = () => inputRef.current?.click();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!file) {
            setError('Selecciona un archivo');
            return;
        }

        try {
            setUploading(true);

            console.log("📌 Archivo seleccionado:", file.name);

            // 1️⃣ Obtener URL presignada
            const { uploadUrl, fields, fileUrl } = await getPresignedUrl(
                file.name,
                file.type
            );

            // 2️⃣ Subir archivo a S3
            await uploadToS3(uploadUrl, fields, file);

            // 3️⃣ Iniciar análisis
            const { analysisId } = await startAnalysis(fileUrl);

            // 4️⃣ Guardar ID para consultar resultado
            console.log("🎯 ID de análisis:", analysisId);

            // Redirigir a página de resultados
            navigate(`/result/${analysisId}`);

        } catch (err) {
            console.error("❌ UPLOAD FAILED");
            console.error("Mensaje:", err.message);
            setError(err.message || 'Error en la subida');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="upload-modal-overlay" role="dialog" aria-modal="true">
            <div className="upload-modal">
                <button className="upload-close" onClick={onClose} aria-label="Cerrar">×</button>

                <h2 className="upload-title">Sube tu imagen o video</h2>

                <div className="upload-dropzone" onClick={triggerFileSelect}>
                    {!file && (
                        <>
                            <div className="upload-placeholder">
                                <div className="upload-arrow">↑</div>
                                <div>Haz click o arrastra para seleccionar un archivo</div>
                                <small>(.jpeg .jpg .png .mp4) — máximo 60MB</small>
                            </div>
                        </>
                    )}

                    {file && (
                        <div className="upload-preview">
                            <div className="file-name">{file.name}</div>
                            <div className="file-size">{(file.size / (1024*1024)).toFixed(2)} MB</div>
                        </div>
                    )}

                    <input
                        ref={inputRef}
                        type="file"
                        accept=".jpeg,.jpg,.png,.mp4"
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />
                </div>

                {error && <div className="upload-error">{error}</div>}

                <div className="upload-actions">
                    <button className="btn secondary" onClick={onClose} disabled={uploading}>
                        Cancelar
                    </button>
                    <button className="btn primary" onClick={handleSubmit} disabled={uploading}>
                        {uploading ? <span className="spinner" /> : 'Subir y Analizar'}
                    </button>
                </div>
            </div>
        </div>
    );
}