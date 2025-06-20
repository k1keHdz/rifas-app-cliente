// src/components/SeleccionarRifaHistorial.js

import React from 'react';
import ListaRifasMinimalista from './ListaRifasMinimalista';
import { Link } from 'react-router-dom';

function SeleccionarRifaHistorial() {
  return (
    // REPARACIÓN: Se eliminan las clases de color del div principal.
    <div className="bg-background-dark p-4 sm:p-8 max-w-4xl mx-auto min-h-screen">
      {/* REPARACIÓN: Se usa text-accent-primary para el enlace. */}
      <Link to="/admin" className="text-accent-primary hover:underline mb-8 inline-block">
        ← Volver al Panel
      </Link>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">Historial de Ventas</h1>
        <p className="mt-2 text-lg text-text-subtle">Selecciona un sorteo para ver su historial detallado.</p>
      </div>
      
      <ListaRifasMinimalista />
    </div>
  );
}

export default SeleccionarRifaHistorial; 
