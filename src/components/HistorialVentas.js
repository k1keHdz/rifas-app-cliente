// src/components/HistorialVentas.js
import React from 'react';
import { Link } from 'react-router-dom';

function HistorialVentas({ 
  ventasFiltradas = [], 
  mostrarTotal, 
  onConfirmarPago, 
  onLiberarBoletos,
  // ==================================================================
  // INICIO DE CAMBIOS: Aceptamos las nuevas props para notificaciones
  // ==================================================================
  onNotificarWhatsApp,
  onNotificarEmail
  // ==================================================================
  // FIN DE CAMBIOS
  // ==================================================================
}) {

  const totalBoletos = ventasFiltradas.reduce((sum, v) => sum + (v.cantidad || 0), 0);
  const paddingLength = 5;

  return (
    <div className="overflow-x-auto bg-white p-4 rounded-lg shadow mt-6 border">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Historial de Ventas y Apartados</h2>
      {ventasFiltradas.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No hay ventas que coincidan con los filtros actuales.</p>
      ) : (
        <table className="min-w-full text-left border-collapse">
          <thead className="bg-gray-100">
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border font-semibold text-sm text-gray-600">ID Compra</th>
              <th className="px-4 py-2 border font-semibold text-sm text-gray-600">Fecha</th>
              <th className="px-4 py-2 border font-semibold text-sm text-gray-600">Comprador</th>
              <th className="px-4 py-2 border font-semibold text-sm text-gray-600">Números</th>
              <th className="px-4 py-2 border font-semibold text-sm text-gray-600 text-center">Cant.</th>
              <th className="px-4 py-2 border font-semibold text-sm text-gray-600">Estado</th>
              <th className="px-4 py-2 border font-semibold text-sm text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ventasFiltradas.map((venta) => {
              const esApartado = venta.estado === 'apartado';
              const esComprado = venta.estado === 'comprado';
              const haExpirado = esApartado && venta.fechaExpiracion && venta.fechaExpiracion.toDate() < new Date();
              
              return (
                <tr key={venta.id} className="border-t hover:bg-gray-50 text-sm">
                  <td className="px-4 py-2 border align-top font-mono text-xs font-bold text-purple-700">
                    {venta.idCompra || '-'}
                  </td>
                  <td className="px-4 py-2 border align-top whitespace-nowrap">
                    {venta.fechaApartado?.toDate?.().toLocaleString('es-MX') || "-"}
                  </td>
                  <td className="px-4 py-2 border align-top">
                    <p className="font-medium">{venta.comprador?.nombre} {venta.comprador?.apellidos || ''}</p>
                    <p className="text-gray-600">{venta.comprador?.telefono || ''}</p>
                    <p className="text-gray-600 text-xs italic">{venta.comprador?.email || ''}</p>
                  </td>
                  <td className="px-4 py-2 border align-top font-mono">
                    <div className="max-w-xs break-words">
                      {venta.numeros?.map(n => String(n).padStart(paddingLength, '0')).join(', ')}
                    </div>
                  </td>
                  <td className="px-4 py-2 border align-top text-center font-bold">
                    {venta.cantidad}
                  </td>
                  <td className="px-4 py-2 border align-top">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      esComprado ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {esComprado ? 'Pagado' : 'Apartado'}
                    </span>
                    {esApartado && (
                      <p className={`mt-2 text-xs font-bold ${haExpirado ? 'text-red-600' : 'text-green-600'}`}>
                        {haExpirado ? '¡Expirado!' : 'Vigente'}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-2 border align-top">
                    {/* ================================================================== */}
                    {/* INICIO DE CAMBIOS: Lógica de botones separada y robusta */}
                    {/* ================================================================== */}
                    <div className="flex flex-col gap-2 items-start w-32">
                      {esApartado && (
                        <>
                          <button 
                            onClick={() => onConfirmarPago(venta)}
                            className="w-full bg-green-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-green-700 transition-colors text-center"
                          >
                            Confirmar Pago
                          </button>
                          <button 
                            onClick={() => onLiberarBoletos(venta.id, venta.numeros)}
                            className="w-full bg-gray-500 text-white px-3 py-1 rounded text-xs font-bold hover:bg-gray-600 transition-colors text-center"
                          >
                            Liberar Boletos
                          </button>
                        </>
                      )}

                      {esComprado && (
                        <>
                          <button onClick={() => onNotificarWhatsApp(venta)} className="w-full bg-green-500 text-white px-3 py-1 rounded text-xs font-bold hover:bg-green-600">Notificar WhatsApp</button>
                          <button onClick={() => onNotificarEmail(venta)} className="w-full bg-blue-500 text-white px-3 py-1 rounded text-xs font-bold hover:bg-blue-600 disabled:opacity-50" disabled={!venta.comprador.email}>Notificar Correo</button>
                        </>
                      )}
                    </div>
                    {/* ================================================================== */}
                    {/* FIN DE CAMBIOS */}
                    {/* ================================================================== */}
                  </td>
                </tr>
              );
            })}
          </tbody>
          {mostrarTotal && (
            <tfoot>
              <tr className="bg-gray-100 font-bold">
                <td colSpan="5" className="px-4 py-2 border text-right">Total de Boletos (en esta vista)</td>
                <td className="px-4 py-2 border text-center">{totalBoletos}</td>
                <td className="px-4 py-2 border"></td>
              </tr>
            </tfoot>
          )}
        </table>
      )}
    </div>
  );
}

export default HistorialVentas;