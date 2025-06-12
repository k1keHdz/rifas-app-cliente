// src/components/HistorialVentas.js
import React from 'react';

// AÑADIMOS la prop 'onConfirmarPago' para recibir la función desde el padre
function HistorialVentas({ ventasFiltradas, mostrarTotal, onConfirmarPago }) {
  
  const totalBoletos = ventasFiltradas.reduce((sum, v) => sum + (v.cantidad || 0), 0);
  const paddingLength = 4; // Asumimos un padding para los números de boleto

  return (
    <div className="overflow-x-auto bg-white p-4 rounded-lg shadow mt-6 border">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Historial de Ventas y Apartados</h2>
      {ventasFiltradas.length === 0 ? (
        <p className="text-gray-500">No hay ventas registradas en este rango de fechas.</p>
      ) : (
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100">
              {/* CAMBIO: Nuevas columnas para más detalle */}
              <th className="px-4 py-2 border font-semibold text-sm text-gray-600">Fecha</th>
              <th className="px-4 py-2 border font-semibold text-sm text-gray-600">Comprador</th>
              <th className="px-4 py-2 border font-semibold text-sm text-gray-600">Números</th>
              <th className="px-4 py-2 border font-semibold text-sm text-gray-600">Estado</th>
              <th className="px-4 py-2 border font-semibold text-sm text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ventasFiltradas.map((venta) => (
              <tr key={venta.id} className="border-t hover:bg-gray-50 text-sm">
                <td className="px-4 py-2 border align-top">
                  {venta.fechaApartado?.toDate?.().toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) || "-"}
                </td>
                <td className="px-4 py-2 border align-top">
                  <p className="font-medium">{venta.comprador?.nombre || 'N/A'}</p>
                  <p className="text-gray-600">{venta.comprador?.telefono || ''}</p>
                </td>
                <td className="px-4 py-2 border align-top font-mono">
                  {venta.numeros?.map(n => String(n).padStart(paddingLength, '0')).join(', ')}
                </td>
                <td className="px-4 py-2 border align-top">
                  {/* CAMBIO: Badge de color para el estado */}
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${venta.estado === 'comprado' ? 'bg-red-600' : 'bg-yellow-500'}`}>
                    {venta.estado}
                  </span>
                </td>
                <td className="px-4 py-2 border align-top">
                  {/* CAMBIO: Botón condicional de confirmación */}
                  {venta.estado === 'apartado' && (
                    <button 
                      onClick={() => onConfirmarPago(venta.id, venta.cantidad)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-green-700 transition-colors"
                    >
                      Confirmar Pago
                    </button>
                  )}
                  {venta.estado === 'comprado' && (
                    <span className="text-green-700 font-bold">✓ Confirmado</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          {mostrarTotal && (
            <tfoot>
              <tr className="bg-gray-100 font-bold">
                <td colSpan="2" className="px-4 py-2 border text-right">Total de Boletos (en filtro)</td>
                <td className="px-4 py-2 border">{totalBoletos}</td>
                <td colSpan="2" className="px-4 py-2 border"></td>
              </tr>
            </tfoot>
          )}
        </table>
      )}
    </div>
  );
}

export default HistorialVentas;