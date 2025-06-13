// src/components/ModalInvitacionRegistro.js

import React from 'react';
import { Link } from 'react-router-dom';

function ModalInvitacionRegistro({ onClose, onContinueAsGuest }) {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full text-center transform transition-all"
        onClick={(e) => e.stopPropagation()} // Evita que el clic dentro del modal lo cierre
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-4">¡Casi listo para participar!</h2>
        <p className="text-gray-600 mb-6">
          Crea una cuenta para guardar tu historial de compras, ver el estado de tus boletos y participar en futuras rifas más fácilmente. ¡Es gratis!
        </p>
        
        <div className="space-y-3">
          <Link 
            to="/registro"
            className="block w-full text-center bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Crear Cuenta Nueva
          </Link>
          <Link 
            to="/login"
            className="block w-full text-center bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Ya tengo una cuenta (Iniciar Sesión)
          </Link>
        </div>

        <div className="mt-6">
          <button 
            onClick={onContinueAsGuest}
            className="text-sm text-gray-500 hover:underline"
          >
            Omitir y continuar como invitado
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalInvitacionRegistro;