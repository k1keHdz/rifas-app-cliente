import React from 'react';
import { useRifas } from '../context/RifasContext';
import { RIFAS_ESTADOS } from '../constants/rifas';

function RifasList({ onDeleteRifa }) {
  const { rifas, cargando, seleccionarRifaParaEditar } = useRifas();

  if (cargando) {
    return <p className="text-center">Cargando rifas...</p>;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 overflow-x-auto">
      <div className="min-w-full">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">Nombre de la Rifa</th>
              <th scope="col" className="px-6 py-3">Estado</th>
              <th scope="col" className="px-6 py-3">Tipo</th>
              <th scope="col" className="px-6 py-3">Boletos Vendidos</th>
              <th scope="col" className="px-6 py-3">Precio</th>
              <th scope="col" className="px-6 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rifas.length > 0 ? (
              rifas.map(rifa => (
                <tr key={rifa.id} className="bg-white border-b hover:bg-gray-50">
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {rifa.nombre}
                  </th>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 font-semibold leading-tight text-xs rounded-full ${
                      rifa.estado === RIFAS_ESTADOS.ACTIVA ? 'bg-green-100 text-green-800' :
                      rifa.estado === RIFAS_ESTADOS.PENDIENTE ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {rifa.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 capitalize">
                    {rifa.tipoRifa}
                  </td>
                  <td className="px-6 py-4">
                    {rifa.boletosVendidos || 0} / {rifa.boletos}
                  </td>
                  <td className="px-6 py-4">
                    ${rifa.precio}
                  </td>
                  <td className="px-6 py-4 text-right flex gap-4">
                    <button onClick={() => seleccionarRifaParaEditar(rifa)} className="font-medium text-blue-600 hover:underline">Editar</button>
                    <button onClick={() => onDeleteRifa(rifa.id, rifa.nombre)} className="font-medium text-red-600 hover:underline">Eliminar</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-8 text-gray-500">No se han encontrado rifas. ¡Crea la primera!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RifasList;