// src/components/FeedbackModal.js

import React from 'react';
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa';

const icons = {
    exito: <FaCheckCircle className="h-12 w-12 text-success" />,
    error: <FaTimesCircle className="h-12 w-12 text-danger" />,
    advertencia: <FaExclamationTriangle className="h-12 w-12 text-warning" />,
};

const titleColors = {
    exito: 'text-success',
    error: 'text-danger',
    advertencia: 'text-warning',
};

function FeedbackModal({ type, title, message, onClose }) {
    if (!type) return null;

    const Icon = icons[type] || icons['advertencia'];
    const titleColor = titleColors[type] || 'text-text-primary';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div 
                className="bg-background-light rounded-xl shadow-2xl w-full max-w-sm p-8 text-center border-t-4"
                style={{ borderColor: `rgb(var(--status-color-${type === 'exito' ? 'success' : type}))` }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mx-auto flex items-center justify-center h-16 w-16">
                    {Icon}
                </div>
                <h3 className={`mt-5 text-2xl font-bold ${titleColor}`}>{title}</h3>
                <p className="mt-2 text-base text-text-subtle">{message}</p>
                <div className="mt-8">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full btn btn-primary"
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
}

export default FeedbackModal;
