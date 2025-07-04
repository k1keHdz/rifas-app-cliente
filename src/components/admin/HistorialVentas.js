// src/components/admin/HistorialVentas.js

import React from 'react';
// CORREGIDO: Se eliminó la importación de 'Link' que no se usaba.
// CORREGIDO: Se actualizó la ruta para el helper.
import { formatTicketNumber } from '../../utils/rifaHelper';

function HistorialVentas({ 
    ventas = [],
    showMoney,
    onConfirmarPago, 
    onLiberarBoletos, 
    onNotificarWhatsApp, 
    onNotificarEmail,
    onEnviarRecordatorio,
    totalBoletos,
    onPaginaAnterior,
    onPaginaSiguiente,
    paginaActual,
    totalPaginas,
    cargando,
    isSearching
}) {

    const totalBoletosSum = ventas.reduce((sum, v) => sum + (v.cantidad || 0), 0);
    const totalDineroSum = ventas.reduce((sum, v) => sum + (v.cantidad || 0) * (v.precioBoleto || 0), 0);

    const sinResultados = ventas.length === 0 && !cargando;

    return (
        <div className="overflow-x-auto bg-background-light p-4 rounded-lg shadow mt-6 border border-border-color">
            <h2 className="text-xl font-bold mb-4">Historial de Ventas y Apartados</h2>
            {cargando ? (
                <div className="text-center text-text-subtle py-8">Cargando...</div>
            ) : sinResultados ? (
                <div className="text-center text-text-subtle py-8">
                    {isSearching 
                        ? "No hay resultados para tu búsqueda."
                        : "No hay ventas que coincidan con los filtros actuales."
                    }
                </div>
            ) : (
                <table className="min-w-full text-left">
                    <thead className="bg-background-dark">
                        <tr>
                            <th className="px-4 py-2 border-b border-border-color font-semibold text-sm">ID Compra</th>
                            <th className="px-4 py-2 border-b border-border-color font-semibold text-sm">Fecha</th>
                            <th className="px-4 py-2 border-b border-border-color font-semibold text-sm">Comprador</th>
                            <th className="px-4 py-2 border-b border-border-color font-semibold text-sm">Estado (Residencia)</th>
                            <th className="px-4 py-2 border-b border-border-color font-semibold text-sm">Números</th>
                            <th className="px-4 py-2 border-b border-border-color font-semibold text-sm text-center">Cant.</th>
                            <th className="px-4 py-2 border-b border-border-color font-semibold text-sm">Estado</th>
                            <th className="px-4 py-2 border-b border-border-color font-semibold text-sm">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color">
                        {ventas.map((venta) => {
                            const esApartado = venta.estado === 'apartado';
                            const esComprado = venta.estado === 'comprado';
                            const haExpirado = esApartado && venta.fechaExpiracion && venta.fechaExpiracion.toDate() < new Date();
                            
                            return (
                                <tr key={venta.id} className="hover:bg-border-color/20 text-sm">
                                    <td className="px-4 py-2 align-top font-mono text-xs font-bold text-accent-primary/80">{venta.idCompra || '-'}</td>
                                    <td className="px-4 py-2 align-top whitespace-nowrap text-text-subtle">{venta.fechaApartado?.toDate?.().toLocaleString('es-MX') || "-"}</td>
                                    <td className="px-4 py-2 align-top">
                                        <p className="font-medium">{venta.comprador?.nombre} {venta.comprador?.apellidos || ''}</p>
                                        <p className="text-text-subtle">{venta.comprador?.telefono || ''}</p>
                                        <p className="text-text-subtle text-xs italic">{venta.comprador?.email || ''}</p>
                                    </td>
                                    <td className="px-4 py-2 align-top"><p className="font-medium">{venta.comprador?.estado || 'N/A'}</p></td>
                                    <td className="px-4 py-2 align-top font-mono text-text-subtle"><div className="max-w-xs break-words">{venta.numeros?.map(n => formatTicketNumber(n, totalBoletos)).join(', ')}</div></td>
                                    <td className="px-4 py-2 align-top text-center font-bold">{venta.cantidad}</td>
                                    <td className="px-4 py-2 align-top">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${esComprado ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
                                            {esComprado ? 'Pagado' : 'Apartado'}
                                        </span>
                                        {esApartado && (<p className={`mt-2 text-xs font-bold ${haExpirado ? 'text-danger' : 'text-success'}`}>{haExpirado ? '¡Expirado!' : 'Vigente'}</p>)}
                                    </td>
                                    <td className="px-4 py-2 align-top">
                                        <div className="flex flex-col gap-2 items-start w-32">
                                            {esApartado && !haExpirado && (<button onClick={() => onConfirmarPago(venta)} className="w-full bg-success text-white px-3 py-1 rounded text-xs font-bold hover:bg-green-700 transition-colors text-center">Confirmar Pago</button>)}
                                            {esApartado && (<button onClick={() => onLiberarBoletos(venta)} className="w-full bg-border-color px-3 py-1 rounded text-xs font-bold hover:bg-opacity-50 transition-colors text-center">Liberar Boletos</button>)}
                                            {esApartado && haExpirado && (<button onClick={() => onEnviarRecordatorio(venta)} className="w-full bg-accent-primary text-white px-3 py-1 rounded text-xs font-bold hover:opacity-90 transition-colors text-center">Enviar Recordatorio</button>)}
                                            
                                            {esComprado && (<> 
                                                <button onClick={() => onNotificarWhatsApp(venta)} className="w-full bg-green-500 text-white px-3 py-1 rounded text-xs font-bold hover:bg-green-600 transition-colors text-center">Notificar WhatsApp</button> 
                                                <button onClick={() => onNotificarEmail(venta)} className="w-full bg-blue-500 text-white px-3 py-1 rounded text-xs font-bold hover:bg-blue-600 disabled:opacity-50 transition-colors text-center" disabled={!venta.comprador?.email}>Notificar Correo</button> 
                                            </>)}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        <tr className="bg-background-dark font-bold">
                            <td colSpan="5" className="px-4 py-2 border-t border-border-color text-right text-text-subtle">Total en esta página:</td>
                            <td className="px-4 py-2 border-t border-border-color text-center">{totalBoletosSum}</td>
                            <td colSpan="2" className="px-4 py-2 border-t border-border-color text-left">{showMoney && `($${totalDineroSum.toLocaleString()})`}</td>
                        </tr>
                    </tfoot>
                </table>
            )}
            
            {totalPaginas > 1 && !isSearching && (
                <div className="flex justify-between items-center mt-4">
                    <button onClick={onPaginaAnterior} disabled={paginaActual === 1 || cargando} className="btn btn-secondary disabled:opacity-50">Anterior</button>
                    <span className="text-sm font-semibold">Página {paginaActual} de {totalPaginas}</span>
                    <button onClick={onPaginaSiguiente} disabled={paginaActual >= totalPaginas || cargando} className="btn btn-secondary disabled:opacity-50">Siguiente</button>
                </div>
            )}
        </div>
    );
}

export default HistorialVentas;
