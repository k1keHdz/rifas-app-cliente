// src/components/ModalMaquinaSuerte.js
import React, { useState } from 'react';

const ModalMaquinaSuerte = ({ totalBoletos, boletosOcupados, onCerrar, onSeleccionar, paddingLength = 2 }) => {
  const [cantidad, setCantidad] = useState(1);
  const [sugeridos, setSugeridos] = useState([]);
  const [error, setError] = useState('');

  const generarAleatorios = () => {
    setError('');
    setSugeridos([]);
    
    const disponibles = [];
    // Creamos un Set para búsquedas rápidas y eficientes
    const ocupadosSet = new Set(boletosOcupados.keys());

    for (let i = 0; i < totalBoletos; i++) {
      if (!ocupadosSet.has(i)) {
        disponibles.push(i);
      }
    }

    if (disponibles.length < cantidad) {
      setError(`No hay suficientes boletos disponibles. Solo quedan ${disponibles.length}.`);
      return;
    }

    // Algoritmo de Fisher-Yates para una selección aleatoria eficiente
    for (let i = disponibles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [disponibles[i], disponibles[j]] = [disponibles[j], disponibles[i]];
    }
    
    setSugeridos(disponibles.slice(0, cantidad));
  };

  const opcionesCantidad = [1, 2, 3, 4, 5, 10, 15, 20, 25, 50];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onCerrar}>
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onCerrar} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
        <div className='text-center'>
            <span className='text-5xl'>🎰</span>
            <h2 className="text-2xl font-bold text-center mb-2 mt-2">Máquina de la Suerte</h2>
            <p className='text-gray-600 mb-4 text-sm'>¿No sabes qué número elegir? ¡Deja que la suerte decida por ti!</p>
        </div>
        
        <label htmlFor="cantidad-suerte" className="block mb-1 font-semibold text-gray-700">¿Cuántos boletos quieres?</label>
        <select 
          id="cantidad-suerte"
          className="w-full border-gray-300 border rounded-md p-2 mb-4 focus:ring-2 focus:ring-blue-500" 
          value={cantidad} 
          onChange={(e) => setCantidad(Number(e.target.value))}
        >
          {opcionesCantidad.map(val => <option key={val} value={val}>{val} boleto{val > 1 ? 's' : ''}</option>)}
        </select>
        
        <button 
            onClick={generarAleatorios} 
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          {sugeridos.length === 0 ? `🍀 ¡Generar ${cantidad} al Azar!` : "🎲 Generar Nuevos"}
        </button>

        {sugeridos.length > 0 && (
          <div className='animate-fade-in mt-4'>
            <p className='text-center text-gray-700 mb-2 font-semibold'>¡Tus números de la suerte!</p>
            <div className="flex flex-wrap gap-2 justify-center my-4 p-3 bg-gray-100 rounded-lg">
              {sugeridos.map((n) => (
                <span key={n} className="px-3 py-1 bg-green-600 text-white rounded-md font-mono shadow-sm">{String(n).padStart(paddingLength, "0")}</span>
              ))}
            </div>
            <button onClick={() => onSeleccionar(sugeridos)} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg w-full font-bold text-lg transition-transform transform hover:scale-105">
              ✅ Agregar a mi Selección
            </button>
          </div>
        )}

        {error && <p className="mt-3 text-red-600 text-center text-sm font-semibold">{error}</p>}
      </div>
    </div>
  );
};

export default ModalMaquinaSuerte;