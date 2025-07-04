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
        className="bg-background-light border border-border-color rounded-xl shadow-2xl p-8 max-w-lg w-full text-center transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* REPARACIÓN: Se eliminan clases de color. */}
        <h2 className="text-2xl font-bold mb-4">¡Casi listo para participar!</h2>
        <p className="text-text-subtle mb-6">
          Crea una cuenta para guardar tu historial de compras, ver el estado de tus boletos y participar en futuros sorteos más fácilmente. ¡Es gratis!
        </p>
        
        <div className="space-y-3">
          {/* REPARACIÓN: Se usan clases de botón del tema. */}
          <Link 
            to="/registro"
            className="block w-full text-center btn btn-primary"
          >
            Crear Cuenta Nueva
          </Link>
          <Link 
            to="/login"
            className="block w-full text-center btn btn-secondary"
          >
            Ya tengo una cuenta (Iniciar Sesión)
          </Link>
        </div>

        <div className="mt-6">
          {/* REPARACIÓN: Se usa el color de acento del tema. */}
          <button 
            onClick={onContinueAsGuest}
            className="text-sm text-text-subtle hover:underline hover:text-accent-primary"
          >
            Omitir y continuar como invitado
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalInvitacionRegistro; 
