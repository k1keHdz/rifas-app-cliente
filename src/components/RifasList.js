// src/components/RifasList.js
import React from 'react';
import { useRifas } from '../context/RifasContext';
import { RIFAS_ESTADOS } from '../constants/rifas';

function RifasList({ onDeleteRifa }) {
  const { rifas, cargando, seleccionarRifaParaEditar } = useRifas();

  if (cargando) {
    return <p className="text-center text-text-subtle">Cargando sorteos...</p>;
  }

  return (
    <div className="bg-background-light rounded-xl shadow-lg p-4 sm:p-6 overflow-x-auto border border-border-color">
      <div className="min-w-full">
        <table className="w-full text-sm text-left text-text-subtle">
          <thead className="text-xs text-text-subtle uppercase bg-background-dark">
            <tr>
              <th scope="col" className="px-6 py-3">Nombre del sorteo</th>
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
                <tr key={rifa.id} className="bg-background-light border-b border-border-color hover:bg-border-color/20">
                  <th scope="row" className="px-6 py-4 font-medium text-text-primary whitespace-nowrap">
                    {rifa.nombre}
                  </th>
                  <td className="px-6 py-4">
                    {/* REPARACIÓN: Se usan los colores semánticos del tema para el estado. */}
                    <span className={`px-2 py-1 font-semibold leading-tight text-xs rounded-full ${
                      rifa.estado === RIFAS_ESTADOS.ACTIVA ? 'bg-success/20 text-success' :
                      rifa.estado === RIFAS_ESTADOS.PENDIENTE ? 'bg-warning/20 text-warning' : 'bg-danger/20 text-danger'
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
                    {/* REPARACIÓN: Se usa text-accent-primary para el enlace de editar. */}
                    <button onClick={() => seleccionarRifaParaEditar(rifa)} className="font-medium text-accent-primary hover:underline">Editar</button>
                    <button onClick={() => onDeleteRifa(rifa.id, rifa.nombre)} className="font-medium text-danger/80 hover:underline">Eliminar</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-8 text-text-subtle">No se han encontrado sorteos. ¡Crea el primero!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RifasList; 
