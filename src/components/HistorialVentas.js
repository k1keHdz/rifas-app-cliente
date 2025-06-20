// src/components/HistorialVentas.js
import React from 'react';
import { Link } from 'react-router-dom';
import { formatTicketNumber } from '../utils/rifaHelper';

function HistorialVentas({ 
  ventasFiltradas = [], 
  mostrarTotal, 
  onConfirmarPago, 
  onLiberarBoletos, 
  onNotificarWhatsApp, 
  onNotificarEmail,
  onEnviarRecordatorio,
  totalBoletos
}) {

  const totalBoletosSum = ventasFiltradas.reduce((sum, v) => sum + (v.cantidad || 0), 0);

  return (
    <div className="overflow-x-auto bg-background-light p-4 rounded-lg shadow mt-6 border border-border-color">
      {/* REPARACIÓN: Se elimina text-text-light. */}
      <h2 className="text-xl font-bold mb-4">Historial de Ventas y Apartados</h2>
      {ventasFiltradas.length === 0 ? (
        <p className="text-center text-text-subtle py-8">No hay ventas que coincidan con los filtros actuales.</p>
      ) : (
        <table className="min-w-full text-left">
          <thead className="bg-background-dark">
            <tr>
              {/* REPARACIÓN: Se elimina text-text-subtle de los encabezados. */}
              <th className="px-4 py-2 border-b border-border-color font-semibold text-sm">ID Compra</th>
              <th className="px-4 py-2 border-b border-border-color font-semibold text-sm">Fecha</th>
              <th className="px-4 py-2 border-b border-border-color font-semibold text-sm">Comprador</th>
              <th className="px-4 py-2 border-b border-border-color font-semibold text-sm">Números</th>
              <th className="px-4 py-2 border-b border-border-color font-semibold text-sm text-center">Cant.</th>
              <th className="px-4 py-2 border-b border-border-color font-semibold text-sm">Estado</th>
              <th className="px-4 py-2 border-b border-border-color font-semibold text-sm">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-color">
            {ventasFiltradas.map((venta) => {
              const esApartado = venta.estado === 'apartado';
              const esComprado = venta.estado === 'comprado';
              const haExpirado = esApartado && venta.fechaExpiracion && venta.fechaExpiracion.toDate() < new Date();
              
              return (
                <tr key={venta.id} className="hover:bg-border-color/20 text-sm">
                  {/* REPARACIÓN: Se usa text-accent-primary para el ID para darle un toque interactivo. */}
                  <td className="px-4 py-2 align-top font-mono text-xs font-bold text-accent-primary/80">
                    {venta.idCompra || '-'}
                  </td>
                  <td className="px-4 py-2 align-top whitespace-nowrap text-text-subtle">
                    {venta.fechaApartado?.toDate?.().toLocaleString('es-MX') || "-"}
                  </td>
                  <td className="px-4 py-2 align-top">
                    <p className="font-medium">{venta.comprador?.nombre} {venta.comprador?.apellidos || ''}</p>
                    <p className="text-text-subtle">{venta.comprador?.telefono || ''}</p>
                    <p className="text-text-subtle text-xs italic">{venta.comprador?.email || ''}</p>
                  </td>
                  <td className="px-4 py-2 align-top font-mono text-text-subtle">
                    <div className="max-w-xs break-words">
                      {venta.numeros?.map(n => formatTicketNumber(n, totalBoletos)).join(', ')}
                    </div>
                  </td>
                  <td className="px-4 py-2 align-top text-center font-bold">
                    {venta.cantidad}
                  </td>
                  <td className="px-4 py-2 align-top">
                    {/* REPARACIÓN: Se usan los colores semánticos del tema. */}
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      esComprado ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
                    }`}>
                      {esComprado ? 'Pagado' : 'Apartado'}
                    </span>
                    {esApartado && (
                      <p className={`mt-2 text-xs font-bold ${haExpirado ? 'text-danger' : 'text-success'}`}>
                        {haExpirado ? '¡Expirado!' : 'Vigente'}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-2 align-top">
                    <div className="flex flex-col gap-2 items-start w-32">
                      {esApartado && !haExpirado && (
                        <button 
                          onClick={() => onConfirmarPago(venta)}
                          className="w-full bg-success text-white px-3 py-1 rounded text-xs font-bold hover:bg-green-700 transition-colors text-center"
                        >
                          Confirmar Pago
                        </button>
                      )}
                      {esApartado && (
                        <button 
                          onClick={() => onLiberarBoletos(venta.id, venta.numeros)}
                          className="w-full bg-border-color px-3 py-1 rounded text-xs font-bold hover:bg-opacity-50 transition-colors text-center"
                        >
                          Liberar Boletos
                        </button>
                      )}
                      {esApartado && haExpirado && (
                        <button
                          onClick={() => onEnviarRecordatorio(venta)}
                          className="w-full bg-accent-primary text-white px-3 py-1 rounded text-xs font-bold hover:opacity-90 transition-colors text-center"
                        >
                          Enviar Recordatorio
                        </button>
                      )}

                      {esComprado && (
                        <>
                          <button onClick={() => onNotificarWhatsApp(venta)} className="w-full bg-green-500 text-white px-3 py-1 rounded text-xs font-bold hover:bg-green-600">Notificar WhatsApp</button>
                          <button onClick={() => onNotificarEmail(venta)} className="w-full bg-blue-500 text-white px-3 py-1 rounded text-xs font-bold hover:bg-blue-600 disabled:opacity-50" disabled={!venta.comprador.email}>Notificar Correo</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          {mostrarTotal && (
            <tfoot>
              <tr className="bg-background-dark font-bold">
                <td colSpan="5" className="px-4 py-2 border-t border-border-color text-right text-text-subtle">Total de Boletos (en esta vista)</td>
                <td className="px-4 py-2 border-t border-border-color text-center">{totalBoletosSum}</td>
                <td colSpan="2" className="px-4 py-2 border-t border-border-color"></td>
              </tr>
            </tfoot>
          )}
        </table>
      )}
    </div>
  );
}

export default HistorialVentas; 
