// src/components/ModalDatosComprador.js

import { useState, useEffect } from 'react';

function ModalDatosComprador({ onCerrar, onConfirmar, datosIniciales = {} }) {
  const [datos, setDatos] = useState({
    nombre: '',
    telefono: '',
    email: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    // Pre-rellenar el formulario si recibimos datos iniciales (para usuarios logueados)
    setDatos({
      nombre: datosIniciales.nombre || '',
      telefono: datosIniciales.telefono || '',
      email: datosIniciales.email || '',
    });
  }, [datosIniciales]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDatos(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!datos.nombre || !datos.telefono) {
      setError('El nombre y el teléfono son obligatorios.');
      return;
    }
    // Enviamos los datos (ya sea los originales o los modificados) al componente padre
    onConfirmar(datos);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 relative">
        <button onClick={onCerrar} className="absolute top-3 right-3 text-gray-500 hover:text-black text-2xl">
          &times;
        </button>
        <h2 className="text-xl font-bold text-center mb-4">Confirma tus Datos</h2>
        <p className="text-center text-sm text-gray-600 mb-6">
          Estos datos se usarán para contactarte en caso de que ganes.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
            <input
              type="text"
              name="nombre"
              value={datos.nombre}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
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
            <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
            <input
              type="email"
              name="email"
              value={datos.email}
              onChange={handleChange}
              required
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