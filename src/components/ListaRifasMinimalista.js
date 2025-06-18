// src/components/ListaRifasMinimalista.js

import React from 'react';
import { useRifas } from '../context/RifasContext';
import { Link } from 'react-router-dom';

function ListaRifasMinimalista() {
  const { rifas, cargando } = useRifas();

  if (cargando) {
    return <p className="text-center text-text-subtle">Cargando sorteos...</p>;
  }

  return (
    <div className="bg-background-light rounded-xl shadow-lg p-4 sm:p-6 border border-border-color">
      <div className="space-y-3">
        {rifas.length > 0 ? (
          rifas.map(rifa => (
            <Link
              key={rifa.id}
              to={`/admin/rifa/${rifa.id}`}
              className="block p-4 border border-border-color rounded-lg hover:bg-border-color/20 hover:border-accent-start/50 transition-all duration-200"
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg text-text-light">{rifa.nombre}</span>
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                    rifa.estado === 'activa' ? 'bg-success/20 text-green-300' :
                    rifa.estado === 'pendiente' ? 'bg-warning/20 text-yellow-300' : 'bg-danger/20 text-red-300'
                }`}>
                  {rifa.estado}
                </span>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-center text-text-subtle py-4">No se han encontrado sorteos.</p>
        )}
      </div>
    </div>
  );
}

export default ListaRifasMinimalista;
