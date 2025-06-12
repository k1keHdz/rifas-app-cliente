// src/components/ListaRifasMinimalista.js

import React from 'react';
import { useRifas } from '../context/RifasContext';
import { Link } from 'react-router-dom';

function ListaRifasMinimalista() {
  const { rifas, cargando } = useRifas();

  if (cargando) {
    return <p className="text-center">Cargando rifas...</p>;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
      <div className="space-y-3">
        {rifas.length > 0 ? (
          rifas.map(rifa => (
            <Link
              key={rifa.id}
              to={`/admin/rifa/${rifa.id}`}
              className="block p-4 border rounded-lg hover:bg-gray-50 hover:border-blue-500 transition-all duration-200"
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg text-gray-800">{rifa.nombre}</span>
                <span className={`px-3 py-1 text-xs font-bold text-white rounded-full ${
                    rifa.estado === 'activa' ? 'bg-green-500' :
                    rifa.estado === 'pendiente' ? 'bg-yellow-500' : 'bg-red-500'
                }`}>
                  {rifa.estado}
                </span>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-center text-gray-500 py-4">No se han encontrado rifas.</p>
        )}
      </div>
    </div>
  );
}

export default ListaRifasMinimalista;