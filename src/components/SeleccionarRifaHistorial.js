// src/components/SeleccionarRifaHistorial.js

import React from 'react';
// CAMBIO: Ahora importamos nuestro nuevo componente de lista minimalista
import ListaRifasMinimalista from './ListaRifasMinimalista';
import { Link } from 'react-router-dom';

function SeleccionarRifaHistorial() {
  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
        <Link to="/admin" className="text-blue-600 hover:underline mb-8 inline-block">
            ← Volver al Panel
        </Link>
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800">Historial de Ventas</h1>
            <p className="mt-2 text-lg text-gray-600">Selecciona una rifa para ver su historial detallado.</p>
        </div>
        
        {/* CAMBIO: Usamos el nuevo componente */}
        <ListaRifasMinimalista />
    </div>
  );
}

export default SeleccionarRifaHistorial;