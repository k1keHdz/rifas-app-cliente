// src/components/ModalVentaManual.js

import React, { useState, useMemo } from 'react';
import { doc, collection, writeBatch, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useBoletos } from '../hooks/useBoletos';
import Alerta from './Alerta';
import { nanoid } from 'nanoid';
import BuscadorBoletos from './BuscadorBoletos';
import { formatTicketNumber } from '../utils/rifaHelper';

function SelectorDeBoletosInterno({ numeros, boletosOcupados, boletosSeleccionados, onToggleBoleto, paddingLength }) {
  return (
    <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-1.5 w-max mx-auto p-1">
      {numeros.map(numeroBoleto => {
        const estaOcupado = boletosOcupados.has(numeroBoleto);
        if (estaOcupado) return null;
        const estaSeleccionado = boletosSeleccionados.includes(numeroBoleto);
        const color = estaSeleccionado ? 'bg-green-600 text-white' : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-200';
        return (
          <button type="button" key={numeroBoleto} onClick={() => onToggleBoleto(numeroBoleto)} className={`border w-12 h-9 rounded text-xs font-mono transition-transform transform hover:scale-110 ${color}`}>
            {formatTicketNumber(numeroBoleto, null)}
          </button>
        );
      })}
    </div>
  );
}

function ModalVentaManual({ rifa, onClose }) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [comprador, setComprador] = useState({ nombre: '', apellidos: '', telefono: '', email: '' });
  const [ventaRealizada, setVentaRealizada] = useState(null);
  const { boletosOcupados, boletosSeleccionados, toggleBoleto, limpiarSeleccion, agregarMultiplesBoletos, seleccionarBoleto } = useBoletos(rifa.id);
  const [currentPage, setCurrentPage] = useState(1);
  const [boletosPorPagina] = useState(200);
  const [cantidadAleatoria, setCantidadAleatoria] = useState(5);

  const paddingLength = useMemo(() => String(rifa.boletos - 1).length, [rifa.boletos]);
  const totalPaginas = useMemo(() => Math.ceil(rifa.boletos / boletosPorPagina), [rifa.boletos, boletosPorPagina]);
  
  const numerosParaMostrar = useMemo(() => {
    const todosLosNumeros = Array.from({ length: rifa.boletos }, (_, i) => i);
    const inicio = (currentPage - 1) * boletosPorPagina;
    const fin = inicio + boletosPorPagina;
    return todosLosNumeros.slice(inicio, fin);
  }, [rifa.boletos, currentPage, boletosPorPagina]);

  const handleChange = (e) => setComprador({ ...comprador, [e.target.name]: e.target.value });

  const generarMensajeWhatsApp = (venta) => {
    const boletosTexto = venta.numeros.map(n => formatTicketNumber(n, rifa.boletos)).join(', ');
    let mensaje = `¡Felicidades, ${venta.comprador.nombre}! 🎉 Tu compra para el sorteo "${venta.nombreRifa}" ha sido registrada con éxito.\n\n`;
    mensaje += `ID de Compra: *${venta.idCompra}*\n\n`;
    mensaje += `Aquí tienes el resumen de tu compra:\n*Tus números:* ${boletosTexto}\n*Estado:* Pagado\n\n`;
    mensaje += `¡Te deseamos mucha suerte!`;
    return encodeURIComponent(mensaje);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (boletosSeleccionados.length === 0) { return setError('Debes seleccionar al menos un boleto.'); }
    if (!comprador.nombre || !comprador.apellidos || !comprador.telefono) { return setError('El nombre, apellidos y teléfono son obligatorios.'); }
    
    setIsSubmitting(true);
    setError('');
    try {
      const batch = writeBatch(db);
      const idCompra = nanoid(8).toUpperCase();
      const ventaData = {
        idCompra,
        comprador,
        numeros: boletosSeleccionados,
        cantidad: boletosSeleccionados.length,
        estado: 'comprado',
        fechaApartado: serverTimestamp(),
        rifaId: rifa.id,
        nombreRifa: rifa.nombre,
        imagenRifa: rifa.imagenes?.[0] || null,
        userId: null,
        precioBoleto: rifa.precio,
      };
      const ventasRef = collection(db, "rifas", rifa.id, "ventas");
      const nuevaVentaRef = doc(ventasRef); 
      batch.set(nuevaVentaRef, ventaData);
      const rifaRef = doc(db, "rifas", rifa.id);
      batch.update(rifaRef, { boletosVendidos: increment(boletosSeleccionados.length) });
      await batch.commit();
      setVentaRealizada({ id: nuevaVentaRef.id, ...ventaData });
      setStep(2);
    } catch (err) {
      console.error("Error al registrar venta manual:", err);
      setError('Ocurrió un error al registrar la venta.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-2 sm:p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 max-w-3xl w-full max-h-[95vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {step === 1 && (
          <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
            {/* --- Encabezado Fijo --- */}
            <div className='flex-shrink-0'>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Registrar Venta Manual</h2>
                {error && <div className="mb-4"><Alerta mensaje={error} tipo="error" onClose={() => setError('')} /></div>}
            </div>

            {/* --- Área de Contenido con Scroll --- */}
            <div className='flex-grow min-h-0 overflow-y-auto pr-2'>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <input name="nombre" value={comprador.nombre} onChange={handleChange} placeholder="Nombre(s) del Comprador*" required className="w-full border rounded p-2"/>
                  <input name="apellidos" value={comprador.apellidos} onChange={handleChange} placeholder="Apellidos del Comprador*" required className="w-full border rounded p-2"/>
                  <input name="telefono" value={comprador.telefono} onChange={handleChange} placeholder="Teléfono del Comprador*" required className="w-full border rounded p-2"/>
                  <input name="email" type="email" value={comprador.email} onChange={handleChange} placeholder="Email (para comprobante)" className="w-full border rounded p-2"/>
                </div>
                
                <div className="mb-4 p-3 border rounded-lg bg-gray-50 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Buscador de Boleto Específico</label>
                    <BuscadorBoletos
                      totalBoletos={rifa.boletos}
                      boletosOcupados={boletosOcupados}
                      boletosSeleccionados={boletosSeleccionados}
                      onSelectBoleto={seleccionarBoleto}
                      paddingLength={paddingLength}
                    />
                  </div>
                  <div>
                    <label htmlFor="cantidad-aleatoria" className="block text-sm font-medium text-gray-700 mb-1">Máquina de la Suerte</label>
                    <div className="flex items-center gap-2">
                      <input
                        id="cantidad-aleatoria"
                        type="number"
                        value={cantidadAleatoria}
                        onChange={(e) => setCantidadAleatoria(Number(e.target.value))}
                        className="w-24 border-gray-300 rounded-md shadow-sm"
                        min="1"
                      />
                      <button
                        type="button"
                        onClick={() => agregarMultiplesBoletos(cantidadAleatoria, rifa.boletos)}
                        className="flex-1 bg-blue-500 text-white font-semibold p-2 rounded-lg hover:bg-blue-600"
                      >
                        Generar Boletos
                      </button>
                    </div>
                  </div>
                </div>

                {boletosSeleccionados.length > 0 && (
                  <div className="mb-2 p-3 border rounded-lg bg-gray-50">
                    <p className="font-bold text-sm mb-2 text-gray-800">{boletosSeleccionados.length} BOLETO(S) SELECCIONADO(S)</p>
                    <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                      {boletosSeleccionados.sort((a,b) => a-b).map(n => <span key={n} className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-mono text-xs cursor-pointer" onClick={() => toggleBoleto(n)} title="Clic para quitar">{formatTicketNumber(n, rifa.boletos)}</span>)}
                    </div>
                    <button type="button" onClick={limpiarSeleccion} className="mt-2 text-red-600 text-xs hover:underline">Limpiar selección</button>
                  </div>
                )}
                
                <div className="border p-2 rounded-lg bg-gray-100">
                  <SelectorDeBoletosInterno numeros={numerosParaMostrar} boletosOcupados={boletosOcupados} boletosSeleccionados={boletosSeleccionados} onToggleBoleto={toggleBoleto} paddingLength={paddingLength} />
                </div>
            </div>
            
            {/* --- Pie de Página Fijo --- */}
            <div className='flex-shrink-0'>
                <div className="flex justify-between items-center mt-2 p-1">
                  <button type="button" onClick={() => setCurrentPage(p => p > 1 ? p - 1 : 1)} disabled={currentPage === 1} className="text-sm px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Anterior</button>
                  <span className="text-xs font-mono">Página {currentPage} de {totalPaginas}</span>
                  <button type="button" onClick={() => setCurrentPage(p => p < totalPaginas ? p + 1 : p)} disabled={currentPage === totalPaginas} className="text-sm px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Siguiente</button>
                </div>
                
                <div className="flex justify-end gap-4 mt-4 border-t pt-4">
                  <button type="button" onClick={onClose} className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600">Cancelar</button>
                  <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                    {isSubmitting ? 'Registrando...' : 'Registrar Venta'}
                  </button>
                </div>
            </div>
          </form>
        )}
        {step === 2 && (
          <div className="text-center animate-fade-in">
            <h2 className="text-2xl font-bold text-green-600 mb-4">¡Venta Registrada con Éxito!</h2>
            <p className="mb-6 text-gray-700">La venta ha sido guardada. Ahora puedes enviar un comprobante al cliente.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a href={`https://wa.me/52${ventaRealizada.comprador.telefono}?text=${generarMensajeWhatsApp(ventaRealizada)}`} target="_blank" rel="noopener noreferrer" className="bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition-colors w-full text-center">Enviar por WhatsApp</a>
              <button disabled className="bg-gray-300 text-gray-500 font-bold py-3 px-6 rounded-lg cursor-not-allowed w-full">Enviar por Correo (Próximamente)</button>
            </div>
            <button onClick={onClose} className="mt-8 text-sm text-gray-500 hover:underline">Finalizar y Cerrar</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ModalVentaManual;
