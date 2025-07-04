// src/components/ModalCooldown.js

import React from 'react';

const RelojIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-12 w-12 text-accent-primary mx-auto mb-4">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
);

const ModalCooldown = ({ onClose, timeLeft }) => {
    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-background-light border border-border-color rounded-xl shadow-2xl max-w-sm w-full p-6 sm:p-8 text-center relative" 
                onClick={(e) => e.stopPropagation()}
            >
                <RelojIcon />

                <h2 className="text-2xl font-bold mb-2">¡Un Momento, Por Favor!</h2>
                
                <p className="text-text-subtle mb-6">
                    Para prevenir compras duplicadas por error, hemos establecido un breve tiempo de espera.
                </p>
                
                <div className="bg-background-dark p-4 rounded-lg border border-border-color">
                    <p className="text-sm text-text-subtle">Podrás volver a participar en:</p>
                    <p className="text-xl font-bold text-accent-primary mt-1">
                        {timeLeft}
                    </p>
                </div>

                <button
                    onClick={onClose}
                    className="mt-6 w-full btn btn-primary"
                >
                    Entendido
                </button>
            </div>
        </div>
    );
};

export default ModalCooldown;
