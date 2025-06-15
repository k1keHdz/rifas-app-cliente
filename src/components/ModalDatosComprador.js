// src/components/ModalDatosComprador.js

import { useState, useEffect } from 'react';

function ModalDatosComprador({ onCerrar, onConfirmar, datosIniciales = {} }) {
  // ==================================================================
  // INICIO DE CAMBIOS: Añadimos 'apellidos' al estado inicial
  // ==================================================================
  const [datos, setDatos] = useState({
    nombre: '',
    apellidos: '',
    telefono: '',
    email: '',
  });
  // ==================================================================
  // FIN DE CAMBIOS
  // ==================================================================
  const [error, setError] = useState('');

  useEffect(() => {
    // Pre-rellenar el formulario si recibimos datos iniciales (para usuarios logueados)
    // ==================================================================
    // INICIO DE CAMBIOS: Pre-rellenamos también los apellidos
    // ==================================================================
    setDatos({
      nombre: datosIniciales.nombre || '',
      apellidos: datosIniciales.apellidos || '',
      telefono: datosIniciales.telefono || '',
      email: datosIniciales.email || '',
    });
    // ==================================================================
    // FIN DE CAMBIOS
    // ==================================================================
  }, [datosIniciales]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDatos(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // ==================================================================
    // INICIO DE CAMBIOS: Validación para nombre y apellidos
    // ==================================================================
    if (!datos.nombre || !datos.apellidos || !datos.telefono) {
      setError('El nombre, apellidos y teléfono son obligatorios.');
      return;
    }
    // ==================================================================
    // FIN DE CAMBIOS
    // ==================================================================

    // Enviamos el objeto 'datos' completo, que ahora incluye los apellidos
    onConfirmar(datos);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onCerrar}>
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onCerrar} className="absolute top-3 right-3 text-gray-500 hover:text-black text-2xl">
          &times;
        </button>
        <h2 className="text-xl font-bold text-center mb-4">Confirma tus Datos</h2>
        <p className="text-center text-sm text-gray-600 mb-6">
          Estos datos se usarán para contactarte en caso de que ganes.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ================================================================== */}
          {/* INICIO DE CAMBIOS: Dividimos el campo de nombre en dos */}
          {/* ================================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="modal-nombre" className="block text-sm font-medium text-gray-700">Nombre(s)</label>
              <input
                id="modal-nombre"
                type="text"
                name="nombre"
                value={datos.nombre}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="modal-apellidos" className="block text-sm font-medium text-gray-700">Apellidos</label>
              <input
                id="modal-apellidos"
                type="text"
                name="apellidos"
                value={datos.apellidos}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          {/* ================================================================== */}
          {/* FIN DE CAMBIOS */}
          {/* ================================================================== */}
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Teléfono (WhatsApp)</label>
            <input
              type="tel"
              name="telefono"
              value={datos.telefono}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Correo Electrónico (Opcional)</label>
            <input
              type="email"
              name="email"
              value={datos.email}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {error && <p className="text-sm text-center text-red-600">{error}</p>}

          <div className="pt-4">
            <button
              type="submit"
              className="w-full px-6 py-3 font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              Confirmar y Apartar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalDatosComprador;