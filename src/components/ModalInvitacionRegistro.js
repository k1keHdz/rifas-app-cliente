// src/components/ModalInvitacionRegistro.js

import React from 'react';
import { Link } from 'react-router-dom';

function ModalInvitacionRegistro({ onClose, onContinueAsGuest }) {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-background-light text-text-light border border-border-color rounded-xl shadow-2xl p-8 max-w-lg w-full text-center transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-text-light mb-4">¡Casi listo para participar!</h2>
        <p className="text-text-subtle mb-6">
          Crea una cuenta para guardar tu historial de compras, ver el estado de tus boletos y participar en futuros sorteos más fácilmente. ¡Es gratis!
        </p>
        
        <div className="space-y-3">
          <Link 
            to="/registro"
            className="block w-full text-center bg-gradient-to-r from-accent-start to-accent-end text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity"
          >
            Crear Cuenta Nueva
          </Link>
          <Link 
            to="/login"
            className="block w-full text-center bg-background-dark border border-border-color text-text-light font-bold py-3 px-6 rounded-lg hover:bg-border-color/50 transition-colors"
          >
            Ya tengo una cuenta (Iniciar Sesión)
          </Link>
        </div>

        <div className="mt-6">
          <button 
            onClick={onContinueAsGuest}
            className="text-sm text-text-subtle hover:underline hover:text-accent-start"
          >
            Omitir y continuar como invitado
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalInvitacionRegistro;
