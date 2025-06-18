// src/components/SeleccionarRifaHistorial.js

import React from 'react';
import ListaRifasMinimalista from './ListaRifasMinimalista';
import { Link } from 'react-router-dom';

function SeleccionarRifaHistorial() {
  return (
    <div className="bg-background-dark text-text-light p-4 sm:p-8 max-w-4xl mx-auto min-h-screen">
        <Link to="/admin" className="text-accent-start hover:underline mb-8 inline-block">
            ← Volver al Panel
        </Link>
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-text-light">Historial de Ventas</h1>
            <p className="mt-2 text-lg text-text-subtle">Selecciona un sorteo para ver su historial detallado.</p>
        </div>
        
        <ListaRifasMinimalista />
    </div>
  );
}

export default SeleccionarRifaHistorial;
