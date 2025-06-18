// src/components/ModalDatosComprador.js

import { useState, useEffect } from 'react';

function ModalDatosComprador({ onCerrar, onConfirmar, datosIniciales = {} }) {
  const [datos, setDatos] = useState({
    nombre: '',
    apellidos: '',
    telefono: '',
    email: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    setDatos({
      nombre: datosIniciales.nombre || '',
      apellidos: datosIniciales.apellidos || '',
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
    if (!datos.nombre || !datos.apellidos || !datos.telefono) {
      setError('El nombre, apellidos y teléfono son obligatorios.');
      return;
    }
    onConfirmar(datos);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onCerrar}>
      <div className="bg-background-light text-text-light border border-border-color rounded-lg shadow-xl max-w-lg w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onCerrar} className="absolute top-3 right-3 text-text-subtle hover:text-text-light text-2xl">
          &times;
        </button>
        <h2 className="text-xl font-bold text-center mb-4 text-text-light">Confirma tus Datos</h2>
        <p className="text-center text-sm text-text-subtle mb-6">
          Estos datos se usarán para contactarte en caso de que ganes.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="modal-nombre" className="block text-sm font-medium text-text-subtle">Nombre(s)</label>
              <input
                id="modal-nombre" type="text" name="nombre" value={datos.nombre} onChange={handleChange} required
                className="mt-1 block w-full px-3 py-2 bg-background-dark text-text-light border border-border-color rounded-md shadow-sm focus:ring-accent-start focus:border-accent-start"
              />
            </div>
            <div>
              <label htmlFor="modal-apellidos" className="block text-sm font-medium text-text-subtle">Apellidos</label>
              <input
                id="modal-apellidos" type="text" name="apellidos" value={datos.apellidos} onChange={handleChange} required
                className="mt-1 block w-full px-3 py-2 bg-background-dark text-text-light border border-border-color rounded-md shadow-sm focus:ring-accent-start focus:border-accent-start"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-subtle">Teléfono (WhatsApp)</label>
            <input
              type="tel" name="telefono" value={datos.telefono} onChange={handleChange} required
              className="mt-1 block w-full px-3 py-2 bg-background-dark text-text-light border border-border-color rounded-md shadow-sm focus:ring-accent-start focus:border-accent-start"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-subtle">Correo Electrónico (Opcional)</label>
            <input
              type="email" name="email" value={datos.email} onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-background-dark text-text-light border border-border-color rounded-md shadow-sm focus:ring-accent-start focus:border-accent-start"
            />
          </div>

          {error && <p className="text-sm text-center text-danger/90">{error}</p>}

          <div className="pt-4">
            <button
              type="submit"
              className="w-full px-6 py-3 font-bold text-white bg-success rounded-lg hover:bg-green-700 transition-colors"
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
