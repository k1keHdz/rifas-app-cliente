// src/components/HistorialVentas.js
import React from 'react';

// ==================================================================
// INICIO DE CAMBIOS: Aceptamos la nueva prop 'onLiberarBoletos'
// ==================================================================
function HistorialVentas({ ventasFiltradas, mostrarTotal, onConfirmarPago, onLiberarBoletos }) {
// ==================================================================
// FIN DE CAMBIOS
// ==================================================================
  
  const totalBoletos = ventasFiltradas.reduce((sum, v) => sum + (v.cantidad || 0), 0);
  const paddingLength = 5;

  return (
    <div className="overflow-x-auto bg-white p-4 rounded-lg shadow mt-6 border">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Historial de Ventas y Apartados</h2>
      {ventasFiltradas.length === 0 ? (
        <p className="text-gray-500">No hay ventas registradas en este rango de fechas.</p>
      ) : (
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border font-semibold text-sm text-gray-600">Fecha</th>
              <th className="px-4 py-2 border font-semibold text-sm text-gray-600">Comprador</th>
              <th className="px-4 py-2 border font-semibold text-sm text-gray-600">Números</th>
              <th className="px-4 py-2 border font-semibold text-sm text-gray-600">Estado</th>
              <th className="px-4 py-2 border font-semibold text-sm text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ventasFiltradas.map((venta) => {
              // ==================================================================
              // INICIO DE CAMBIOS: Lógica para verificar si el apartado ha expirado
              // ==================================================================
              const esApartado = venta.estado === 'apartado';
              const haExpirado = esApartado && venta.fechaExpiracion.toDate() < new Date();
              // ==================================================================
              // FIN DE CAMBIOS
              // ==================================================================
              
              return (
                <tr key={venta.id} className="border-t hover:bg-gray-50 text-sm">
                  <td className="px-4 py-2 border align-top">
                    {/* CAMBIO: Mostramos fecha y hora */}
                    {venta.fechaApartado?.toDate?.().toLocaleString('es-MX') || "-"}
                  </td>
                  <td className="px-4 py-2 border align-top">
                    <p className="font-medium">{venta.comprador?.nombre || 'N/A'}</p>
                    <p className="text-gray-600">{venta.comprador?.telefono || ''}</p>
                    {/* CAMBIO: Mostramos el email */}
                    <p className="text-gray-600 text-xs italic">{venta.comprador?.email || ''}</p>
                  </td>
                  <td className="px-4 py-2 border align-top font-mono">
                    {venta.numeros?.map(n => String(n).padStart(paddingLength, '0')).join(', ')}
                  </td>
                  <td className="px-4 py-2 border align-top">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${
                      venta.estado === 'comprado' ? 'bg-green-600' : 'bg-yellow-500'
                    }`}>
                      {venta.estado}
                    </span>
                    {/* CAMBIO: Mostramos el estado de expiración */}
                    {esApartado && (
                      <p className={`mt-2 text-xs font-bold ${haExpirado ? 'text-red-600' : 'text-green-600'}`}>
                        {haExpirado ? '¡Expirado!' : 'Vigente'}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-2 border align-top">
                    <div className="flex flex-col gap-2">
                      {/* CAMBIO: El botón de confirmar ahora también es condicional */}
                      {esApartado && (
                        <button 
                          onClick={() => onConfirmarPago(venta.id, venta.cantidad)}
                          className="w-full bg-green-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-green-700 transition-colors"
                        >
                          Confirmar Pago
                        </button>
                      )}
                      {/* CAMBIO: Nuevo botón para liberar boletos */}
                      {esApartado && (
                        <button 
                          onClick={() => onLiberarBoletos(venta.id, venta.numeros)}
                          className="w-full bg-gray-500 text-white px-3 py-1 rounded text-xs font-bold hover:bg-gray-600 transition-colors"
                        >
                          Liberar Boletos
                        </button>
                      )}
                      {venta.estado === 'comprado' && (
                        <span className="text-green-700 font-bold">✓ Confirmado</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          {mostrarTotal && ( <tfoot>{/* ...código sin cambios... */}</tfoot> )}
        </table>
      )}
    </div>
  );
}

export default HistorialVentas;