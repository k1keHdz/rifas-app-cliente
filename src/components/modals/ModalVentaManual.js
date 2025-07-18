import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { doc, collection, serverTimestamp, runTransaction, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import Alerta from '../ui/Alerta';
import { nanoid } from 'nanoid';
import BuscadorBoletos from '../rifas/BuscadorBoletos';
import { formatTicketNumber, generarMensajeDesdePlantilla } from '../../utils/rifaHelper';
import emailjs from '@emailjs/browser';
import EMAIL_CONFIG from '../../emailjsConfig';
import { FixedSizeList as List } from 'react-window';
import { useConfig } from '../../context/ConfigContext';

// Componente para renderizar una sola fila de botones (para react-window)
const Row = React.memo(({ index, style, data }) => {
    const {
        itemsPerRow,
        boletosOcupados,
        boletosSeleccionados,
        onToggleBoleto,
        totalBoletos,
    } = data;

    const items = [];
    const startIndex = index * itemsPerRow;

    for (let i = 0; i < itemsPerRow; i++) {
        const numeroBoleto = startIndex + i;
        if (numeroBoleto >= totalBoletos) break;

        const estadoBoleto = boletosOcupados.get(numeroBoleto);
        const estaSeleccionado = boletosSeleccionados.includes(numeroBoleto);
        
        let color = 'bg-background-dark text-text-subtle border-border-color hover:bg-border-color/50';
        let estaOcupado = !!estadoBoleto;

        if (estaSeleccionado) {
            if (estaOcupado) {
                color = 'bg-danger text-white ring-2 ring-offset-2 ring-danger';
            } else {
                color = 'bg-success text-white';
            }
        } else if (estadoBoleto === 'apartado') {
            color = 'bg-yellow-400 text-black border-yellow-500';
        } else if (estadoBoleto === 'comprado') {
            color = 'bg-red-600 text-white border-red-700';
        }
        
        const isDisabled = estaOcupado && !estaSeleccionado;

        items.push(
            <button
                type="button"
                key={numeroBoleto}
                onClick={() => onToggleBoleto(numeroBoleto)}
                disabled={isDisabled}
                className={`border w-12 h-9 rounded text-xs font-mono transition-colors ${color} ${isDisabled ? 'cursor-not-allowed opacity-70' : 'transform hover:scale-110'}`}
            >
                {formatTicketNumber(numeroBoleto, totalBoletos)}
            </button>
        );
    }

    return (
        <div style={style} className="flex justify-center items-center gap-1.5 px-1">
            {items}
        </div>
    );
});


function ModalVentaManual({ rifa, onClose, boletosOcupados, boletosSeleccionados, setBoletosSeleccionados, onAgregarMultiples }) {
    const { mensajesConfig } = useConfig();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [comprador, setComprador] = useState({ nombre: '', apellidos: '', telefono: '', email: '', estado: '' });
    const [ventaRealizada, setVentaRealizada] = useState(null);
    const [cantidadAleatoria, setCantidadAleatoria] = useState(5);
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [feedbackMsg, setFeedbackMsg] = useState('');
    const listContainerRef = useRef(null);
    const [listWidth, setListWidth] = useState(0);

    const itemsPerRow = useMemo(() => {
        if (listWidth === 0) return 10;
        return Math.max(1, Math.floor(listWidth / (48 + 6)));
    }, [listWidth]);

    const rowCount = useMemo(() => Math.ceil(rifa.boletos / itemsPerRow), [rifa.boletos, itemsPerRow]);

    useEffect(() => {
        if (listContainerRef.current) {
            setListWidth(listContainerRef.current.offsetWidth);
        }
        const handleResize = () => {
            if (listContainerRef.current) {
                setListWidth(listContainerRef.current.offsetWidth);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleChange = (e) => setComprador({ ...comprador, [e.target.name]: e.target.value });

    const toggleBoletoManual = useCallback((numero) => {
        setBoletosSeleccionados(prevSeleccionados => {
            const yaEstaSeleccionado = prevSeleccionados.includes(numero);
            if (yaEstaSeleccionado) {
                return prevSeleccionados.filter(n => n !== numero);
            } else {
                if (boletosOcupados.has(numero)) {
                    setError(`El boleto ${formatTicketNumber(numero, rifa.boletos)} ya no está disponible.`);
                    return prevSeleccionados;
                }
                setError('');
                return [...prevSeleccionados, numero];
            }
        });
    }, [boletosOcupados, rifa.boletos, setBoletosSeleccionados]);

    const generarMensajeWhatsApp = useCallback((venta) => {
        const plantilla = mensajesConfig?.plantillaPagoConfirmadoAdmin;
        if (!plantilla) {
            console.error("ALERTA: La plantilla 'plantillaPagoConfirmadoAdmin' no está configurada.");
            return encodeURIComponent(`¡Gracias por tu compra! Tu ID es ${venta.idCompra}.`);
        }
        const variables = {
            nombreCliente: venta.comprador.nombre,
            nombreRifa: venta.nombreRifa,
            idCompra: venta.idCompra,
            listaBoletos: venta.numeros.map(n => formatTicketNumber(n, rifa.boletos)).join(', ')
        };
        const mensaje = generarMensajeDesdePlantilla(plantilla, variables);
        return encodeURIComponent(mensaje);
    }, [rifa.boletos, mensajesConfig]);

    const handleNotificarEmail = useCallback(async (venta) => {
        if (!venta.comprador.email) {
            setFeedbackMsg({ text: 'No se proporcionó un correo para este comprador.', type: 'error' });
            return;
        }
        setIsSendingEmail(true);
        setFeedbackMsg({ text: '', type: '' });
        try {
            const boletosTexto = venta.numeros.map(n => formatTicketNumber(n, rifa.boletos)).join(', ');
            const templateParams = { to_email: venta.comprador.email, to_name: `${venta.comprador.nombre} ${venta.comprador.apellidos || ''}`, raffle_name: venta.nombreRifa, ticket_numbers: boletosTexto, id_compra: venta.idCompra };
            await emailjs.send(EMAIL_CONFIG.serviceID, EMAIL_CONFIG.templateID, templateParams, EMAIL_CONFIG.publicKey);
            setFeedbackMsg({ text: 'Correo enviado exitosamente.', type: 'exito' });
        } catch (error) {
            console.error("Fallo al enviar el correo (EmailJS):", error);
            setFeedbackMsg({ text: 'Error al enviar el correo. Revisa la consola.', type: 'error' });
        } finally {
            setIsSendingEmail(false);
        }
    }, [rifa.boletos]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (boletosSeleccionados.length === 0) { return setError('Debes seleccionar al menos un boleto.'); }
        if (!comprador.nombre || !comprador.apellidos || !comprador.telefono || !comprador.estado) { return setError('Nombre, apellidos, estado y teléfono son obligatorios.'); }
        
        setIsSubmitting(true);
        setError('');
        
        try {
            await runTransaction(db, async (transaction) => {
                const ventasRef = collection(db, "rifas", rifa.id, "ventas");
                const CHUNK_SIZE = 30;
                const boletosEnConflicto = new Set();
                
                for (let i = 0; i < boletosSeleccionados.length; i += CHUNK_SIZE) {
                    const chunk = boletosSeleccionados.slice(i, i + CHUNK_SIZE);
                    const q = query(ventasRef, where('numeros', 'array-contains-any', chunk));
                    const snapshot = await getDocs(q);
                    
                    if (!snapshot.empty) {
                        snapshot.docs.forEach(doc => {
                            doc.data().numeros.forEach(num => {
                                if (chunk.includes(num)) {
                                    boletosEnConflicto.add(formatTicketNumber(num, rifa.boletos));
                                }
                            });
                        });
                    }
                }
                
                if (boletosEnConflicto.size > 0) {
                    throw new Error(`¡Conflicto de boletos! El/los boleto(s): ${[...boletosEnConflicto].join(', ')} ya fueron tomados. Por favor, quítalos de tu selección e intenta de nuevo.`);
                }

                const idCompra = nanoid(8).toUpperCase();
                const ventaData = {
                    idCompra, comprador, numeros: boletosSeleccionados,
                    cantidad: boletosSeleccionados.length, estado: 'comprado',
                    fechaApartado: serverTimestamp(), rifaId: rifa.id,
                    nombreRifa: rifa.nombre, imagenRifa: rifa.imagenes?.[0] || null,
                    userId: null, origen: 'manual', precioBoleto: rifa.precio,
                };
                
                const nuevaVentaRef = doc(ventasRef);
                transaction.set(nuevaVentaRef, ventaData);
                setVentaRealizada({ id: nuevaVentaRef.id, ...ventaData });
            });

            setStep(2);

        } catch (err) {
            console.error("Error en la transacción de venta manual:", err);
            setError(err.message || 'Ocurrió un error al registrar la venta. Intenta de nuevo.');
            setIsSubmitting(false);
        }
    }, [boletosSeleccionados, comprador, rifa]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-2 sm:p-4 animate-fade-in">
            <div className="bg-background-light border border-border-color rounded-xl shadow-2xl p-4 sm:p-6 max-w-4xl w-full max-h-[95vh] flex flex-col relative" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-2 right-2 p-2 text-text-subtle hover:text-danger rounded-full transition-colors z-20" aria-label="Cerrar modal">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                
                {step === 1 && (
                    <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
                        <div className='flex-shrink-0'>
                            <h2 className="text-xl sm:text-2xl font-bold mb-4">Registrar Venta Manual</h2>
                            {error && <div className="mb-4"><Alerta mensaje={error} tipo="error" onClose={() => setError('')} /></div>}
                        </div>

                        <div className='flex-grow min-h-0 overflow-y-auto pr-2 space-y-4'>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <input name="nombre" value={comprador.nombre} onChange={handleChange} placeholder="Nombre(s) del Comprador*" required className="input-field"/>
                                <input name="apellidos" value={comprador.apellidos} onChange={handleChange} placeholder="Apellidos del Comprador*" required className="input-field"/>
                                <input name="telefono" value={comprador.telefono} onChange={handleChange} placeholder="Teléfono del Comprador*" required className="input-field"/>
                                <input name="estado" value={comprador.estado} onChange={handleChange} placeholder="Estado de Residencia*" required className="input-field"/>
                                <input name="email" type="email" value={comprador.email} onChange={handleChange} placeholder="Email (para comprobante)" className="input-field sm:col-span-2"/>
                            </div>
                            
                            <div className="p-3 border border-border-color rounded-lg bg-background-dark space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-subtle mb-1">Buscador de Boleto Específico</label>
                                    <BuscadorBoletos
                                        totalBoletos={rifa.boletos}
                                        boletosOcupados={boletosOcupados}
                                        boletosSeleccionados={boletosSeleccionados}
                                        onSelectBoleto={toggleBoletoManual}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="cantidad-aleatoria" className="block text-sm font-medium text-text-subtle mb-1">Máquina de la Suerte</label>
                                    <div className="flex items-center gap-2">
                                        <input id="cantidad-aleatoria" type="number" value={cantidadAleatoria} onChange={(e) => setCantidadAleatoria(Number(e.target.value))} className="input-field w-24 p-2" min="1"/>
                                        <button type="button" onClick={() => onAgregarMultiples(cantidadAleatoria)} className="btn btn-primary flex-1 py-2">Generar Boletos</button>
                                    </div>
                                </div>
                            </div>

                            {boletosSeleccionados.length > 0 && (
                                <div className="p-3 border border-border-color rounded-lg bg-background-dark">
                                    <p className="font-bold text-sm mb-2">{boletosSeleccionados.length} BOLETO(S) SELECCIONADO(S)</p>
                                    <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                                        {boletosSeleccionados.sort((a,b) => a-b).map(n => <span key={n} className="bg-success/20 text-success px-2 py-0.5 rounded-full font-mono text-xs cursor-pointer" onClick={() => toggleBoletoManual(n)} title="Clic para quitar">{formatTicketNumber(n, rifa.boletos)}</span>)}
                                    </div>
                                    <button type="button" onClick={() => setBoletosSeleccionados([])} className="mt-2 text-danger/80 text-xs hover:underline">Limpiar selección</button>
                                </div>
                            )}
                            
                            {/* ===== CORRECCIÓN DE DISEÑO AQUÍ ===== */}
                            <div ref={listContainerRef} className="border border-border-color p-2 rounded-lg bg-background-dark h-64">
                                {listWidth > 0 && (
                                    <List
                                        height={240}
                                        itemCount={rowCount}
                                        itemSize={42}
                                        width="100%" // Se cambia a 100% para que sea adaptable
                                        itemData={{
                                            itemsPerRow,
                                            boletosOcupados,
                                            boletosSeleccionados,
                                            onToggleBoleto: toggleBoletoManual,
                                            totalBoletos: rifa.boletos,
                                        }}
                                    >
                                        {Row}
                                    </List>
                                )}
                            </div>
                        </div>
                        
                        <div className='flex-shrink-0'>
                            <div className="flex justify-end gap-4 mt-4 border-t border-border-color pt-4">
                                <button type="button" onClick={onClose} className="btn btn-secondary">Cancelar</button>
                                <button type="submit" disabled={isSubmitting} className="btn btn-primary disabled:opacity-50">
                                    {isSubmitting ? 'Verificando y Registrando...' : 'Registrar Venta'}
                                </button>
                            </div>
                        </div>
                    </form>
                )}
                {step === 2 && (
                    <div className="text-center animate-fade-in">
                        <h2 className="text-2xl font-bold text-success mb-4">¡Venta Registrada con Éxito!</h2>
                        <p className="mb-6 text-text-subtle">La venta ha sido guardada. Ahora puedes enviar un comprobante al cliente.</p>
                        {feedbackMsg.text && ( <div className="my-4"> <Alerta mensaje={feedbackMsg.text} tipo={feedbackMsg.type} onClose={() => setFeedbackMsg({text: '', type: ''})} /> </div> )}
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <a href={`https://wa.me/52${ventaRealizada.comprador.telefono}?text=${generarMensajeWhatsApp(ventaRealizada)}`} target="_blank" rel="noopener noreferrer" className="btn bg-green-500 text-white hover:bg-green-600 w-full text-center">Enviar por WhatsApp</a>
                            <button onClick={() => handleNotificarEmail(ventaRealizada)} disabled={isSendingEmail || !ventaRealizada.comprador.email} className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
                                {isSendingEmail ? 'Enviando...' : 'Enviar por Correo'}
                            </button>
                        </div>
                        <button onClick={onClose} className="mt-8 text-sm text-text-subtle hover:underline">Finalizar y Cerrar</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default React.memo(ModalVentaManual);
