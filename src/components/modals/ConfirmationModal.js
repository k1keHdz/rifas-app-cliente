// src/components/modals/ConfirmationModal.js

import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirmar', cancelText = 'Cancelar' }) {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-background-light border border-border-color rounded-xl shadow-2xl p-6 max-w-sm w-full mx-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center mb-4">
                        <FaExclamationTriangle className="text-warning text-2xl" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">{title}</h3>
                    <p className="text-sm text-text-subtle mb-6">{message}</p>
                    <div className="flex justify-center gap-4 w-full">
                        <button 
                            onClick={onClose} 
                            className="btn btn-secondary w-full"
                        >
                            {cancelText}
                        </button>
                        <button 
                            onClick={onConfirm} 
                            className="btn bg-danger text-white hover:bg-red-700 w-full"
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ConfirmationModal;
