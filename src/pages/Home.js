// src/pages/Home.js

import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      {/* Sección Hero (Principal) */}
      <div className="bg-gray-800 text-white text-center py-20 sm:py-32">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
            La Suerte Está a un Boleto de Distancia
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-gray-300">
            Participa en nuestras rifas exclusivas y gana premios increíbles. ¡El próximo ganador podrías ser tú!
          </p>
          <Link 
            to="/rifas" 
            className="mt-8 inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105"
          >
            Ver Rifas Disponibles
          </Link>
        </div>
      </div>

      {/* Placeholder para futuras secciones */}
      <div className="py-16 bg-white text-center">
        <h2 className="text-3xl font-bold mb-4">Rifas Destacadas</h2>
        <p className="text-gray-600">Aquí mostraremos las 3 rifas más populares o recientes.</p>
        {/* Lógica para mostrar rifas destacadas irá aquí */}
      </div>

      <div className="py-16 bg-gray-50 text-center">
        <h2 className="text-3xl font-bold mb-4">¿Cómo Participar?</h2>
        <p className="text-gray-600">Aquí irá una sección explicando los pasos.</p>
      </div>
    </div>
  );
}

export default Home;