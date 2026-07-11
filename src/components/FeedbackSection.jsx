import React, { useState } from 'react';

/**
 * FeedbackSection
 * Permite al usuario reportar si el resultado fue correcto o no.
 * Props:
 *  - referenceId: string
 *  - systemVerdict: "REAL" | "FAKE"
 *  - onSubmit: async (payload) => void  ← llama al endpoint
 */
export default function FeedbackSection({ referenceId, systemVerdict, onSubmit }) {
    const [step, setStep]           = useState('initial');   // initial | form | done
    const [userAgreement, setAgreement] = useState(null);    // true | false
    const [userVerdict, setVerdict] = useState('UNSURE');
    const [userComment, setComment] = useState('');
    const [sending, setSending]     = useState(false);
    const [sendError, setSendError] = useState('');

    const handleCorrect = () => {
        setAgreement(true);
        setStep('form');
    };

    const handleIncorrect = () => {
        setAgreement(false);
        setStep('form');
    };

    const handleSubmit = async () => {
        setSending(true);
        setSendError('');
        try {
            await onSubmit({
                userAgreement,
                userVerdict: userAgreement ? systemVerdict : userVerdict,
                userComment: userComment.trim() || null,
            });
            setStep('done');
        } catch (err) {
            setSendError(err.message || 'Error enviando reporte');
        } finally {
            setSending(false);
        }
    };

    if (step === 'done') {
        return (
            <div className="feedback-section">
                <div className="feedback-done">
                    <span className="feedback-done-icon">✓</span>
                    <p>Gracias por tu reporte. Nos ayuda a mejorar el sistema.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="feedback-section">
            <h3 className="feedback-title">¿El resultado fue correcto?</h3>

            {step === 'initial' && (
                <div className="feedback-buttons-row">
                    <button className="feedback-btn feedback-btn-correct" onClick={handleCorrect}>
                        ✓ Correcto
                    </button>
                    <button className="feedback-btn feedback-btn-incorrect" onClick={handleIncorrect}>
                        ✗ Incorrecto
                    </button>
                </div>
            )}

            {step === 'form' && (
                <div className="feedback-form">
                    {/* Si dijo incorrecto, preguntar qué cree que es */}
                    {!userAgreement && (
                        <div className="feedback-verdict-group">
                            <p className="feedback-question">¿Qué crees que es realmente?</p>
                            <div className="feedback-radio-group">
                                {[
                                    { value: 'REAL',   label: 'Real — el contenido es auténtico' },
                                    { value: 'FAKE',   label: 'Falso — el contenido fue manipulado' },
                                    { value: 'UNSURE', label: 'No estoy seguro/a' },
                                ].map(opt => (
                                    <label key={opt.value} className="feedback-radio-label">
                                        <input
                                            type="radio"
                                            name="userVerdict"
                                            value={opt.value}
                                            checked={userVerdict === opt.value}
                                            onChange={() => setVerdict(opt.value)}
                                        />
                                        {opt.label}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    <textarea
                        className="feedback-textarea"
                        placeholder="Comentario opcional (máx. 500 caracteres)..."
                        value={userComment}
                        onChange={(e) => setComment(e.target.value.slice(0, 500))}
                        rows={3}
                    />
                    <small className="feedback-char-count">{userComment.length}/500</small>

                    {sendError && <p className="feedback-error">{sendError}</p>}

                    <div className="feedback-form-actions">
                        <button className="feedback-btn-cancel" onClick={() => setStep('initial')} disabled={sending}>
                            Cancelar
                        </button>
                        <button className="feedback-btn-send" onClick={handleSubmit} disabled={sending}>
                            {sending ? 'Enviando...' : 'Enviar reporte'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}