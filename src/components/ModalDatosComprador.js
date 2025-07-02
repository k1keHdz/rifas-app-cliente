import { useState, useEffect } from 'react';
import { collection, doc, serverTimestamp, Timestamp, runTransaction, query, where, getDocs, increment } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';
import { usePurchaseCooldown } from '../hooks/usePurchaseCooldown';
import { nanoid } from 'nanoid';
import { formatTicketNumber } from '../utils/rifaHelper';

function ModalDatosComprador({ onCerrar, datosIniciales = {}, rifa, boletosSeleccionados, limpiarSeleccion }) {
    const { currentUser } = useAuth();
    const { config } = useConfig();
    const { setCooldown } = usePurchaseCooldown();

    const [datos, setDatos] = useState({
        nombre: '',
        apellidos: '',
        estado: '',
        telefono: '',
        email: '',
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const authEmail = currentUser?.email || '';
        const profileEmail = datosIniciales?.email || '';
        setDatos({
            nombre: datosIniciales?.nombre || '',
            apellidos: datosIniciales?.apellidos || '',
            estado: datosIniciales?.estado || '',
            telefono: datosIniciales?.telefono || '',
            email: authEmail || profileEmail,
        });
    }, [datosIniciales, currentUser]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDatos(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!datos.nombre || !datos.apellidos || !datos.telefono || !datos.estado) {
            setError('El nombre, apellidos, estado y teléfono son obligatorios.');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const ventaRealizada = await runTransaction(db, async (transaction) => {
                const rifaRef = doc(db, "rifas", rifa.id);
                const ventasRef = collection(db, "rifas", rifa.id, "ventas");
                
                const rifaDoc = await transaction.get(rifaRef);
                if (!rifaDoc.exists()) throw new Error("El sorteo ya no existe.");
                
                const rifaActual = rifaDoc.data();
                if (rifaActual.estado !== 'activa') {
                    throw new Error(`Este sorteo ya no está activo (estado: ${rifaActual.estado}).`);
                }

                const CHUNK_SIZE = 30;
                const boletosEnConflicto = new Set();
                for (let i = 0; i < boletosSeleccionados.length; i += CHUNK_SIZE) {
                    const chunk = boletosSeleccionados.slice(i, i + CHUNK_SIZE);
                    const q = query(ventasRef, where('numeros', 'array-contains-any', chunk));
                    const snapshot = await getDocs(q); 
                    if (!snapshot.empty) {
                        snapshot.docs.forEach(doc => {
                            doc.data().numeros.forEach(num => {
                                if (chunk.includes(num)) boletosEnConflicto.add(formatTicketNumber(num, rifa.boletos));
                            });
                        });
                    }
                }
                
                if (boletosEnConflicto.size > 0) {
                     throw new Error(`¡Conflicto! El/los boleto(s) ${[...boletosEnConflicto].join(', ')} ya fue(ron) apartado(s).`);
                }

                const DOCE_HORAS_EN_MS = 12 * 60 * 60 * 1000;
                const idCompra = nanoid(8).toUpperCase();
                const ventaData = {
                    idCompra, comprador: datos, numeros: boletosSeleccionados,
                    cantidad: boletosSeleccionados.length, estado: 'apartado',
                    fechaApartado: serverTimestamp(), fechaExpiracion: Timestamp.fromDate(new Date(Date.now() + DOCE_HORAS_EN_MS)),
                    userId: currentUser ? currentUser.uid : null, rifaId: rifa.id,
                    nombreRifa: rifa.nombre, imagenRifa: (rifa.imagenes && rifa.imagenes[0]) || null,
                    precioBoleto: rifa.precio,
                };
                
                const nuevaVentaRef = doc(ventasRef);
                transaction.set(nuevaVentaRef, ventaData);
                
                // La actualización de contadores se elimina del cliente para evitar errores de permisos.
                // Se recomienda manejar esto con una Cloud Function.
                
                return ventaData;
            });

            if (ventaRealizada) {
                await setCooldown(config, currentUser);
                onCerrar(); 
                const tuNumeroDeWhatsApp = '527773367064';
                const boletosTexto = ventaRealizada.numeros.map(n => formatTicketNumber(n, rifa.boletos)).join(', ');
                const totalAPagar = rifa.precio * ventaRealizada.cantidad;
                const nombreCliente = `${ventaRealizada.comprador.nombre} ${ventaRealizada.comprador.apellidos || ''}`;
                let mensaje = `¡Hola! 👋 Quiero apartar mis boletos para: "${ventaRealizada.nombreRifa}".\n\n*ID de Compra: ${ventaRealizada.idCompra}*\n\nMis números seleccionados son: *${boletosTexto}*.\nTotal a pagar: *$${totalAPagar.toLocaleString('es-MX')}*.\nMi nombre es: ${nombreCliente}.\n\nQuedo a la espera de las instrucciones para realizar el pago. ¡Tengo 12 horas para completarlo! Gracias.`;
                const waUrl = `https://wa.me/${tuNumeroDeWhatsApp}?text=${encodeURIComponent(mensaje)}`;
                window.open(waUrl, '_blank');
                limpiarSeleccion();
            }

        } catch (err) {
            console.error("Error al confirmar apartado:", err);
            setError(err.message || 'Ocurrió un error al intentar apartar los boletos.');
            if (err.message.includes('Conflicto') || err.message.includes('activo')) {
                setTimeout(() => window.location.reload(), 3000);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-background-light border border-border-color rounded-lg shadow-xl max-w-lg w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
                <button onClick={onCerrar} className="absolute top-3 right-3 text-text-subtle hover:text-danger rounded-full p-1 transition-colors z-20">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <h2 className="text-xl font-bold text-center mb-4">Confirma tus Datos</h2>
                <p className="text-center text-sm text-text-subtle mb-6">Estos datos se usarán para contactarte en caso de que ganes.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div><label htmlFor="modal-nombre" className="block text-sm font-medium text-text-subtle">Nombre(s)</label><input id="modal-nombre" type="text" name="nombre" value={datos.nombre} onChange={handleChange} required className="input-field mt-1" /></div>
                        <div><label htmlFor="modal-apellidos" className="block text-sm font-medium text-text-subtle">Apellidos</label><input id="modal-apellidos" type="text" name="apellidos" value={datos.apellidos} onChange={handleChange} required className="input-field mt-1" /></div>
                    </div>
                    <div><label className="block text-sm font-medium text-text-subtle">Teléfono (WhatsApp)</label><input type="tel" name="telefono" value={datos.telefono} onChange={handleChange} required className="input-field mt-1" /></div>
                    <div><label htmlFor="modal-estado" className="block text-sm font-medium text-text-subtle">Estado de Residencia</label><input id="modal-estado" type="text" name="estado" value={datos.estado} onChange={handleChange} required placeholder="Ej. Jalisco" className="input-field mt-1" /></div>
                    <div><label className="block text-sm font-medium text-text-subtle">Correo Electrónico (Opcional)</label><input type="email" name="email" value={datos.email} onChange={handleChange} className="input-field mt-1" /></div>
                    {error && <p className="text-sm text-center text-danger p-2 bg-danger/10 rounded-md">{error}</p>}
                    <div className="pt-4">
                        <button type="submit" disabled={isSubmitting} className="w-full btn bg-success text-white hover:bg-green-700 disabled:opacity-50">
                            {isSubmitting ? 'Verificando y Apartando...' : 'Confirmar y Apartar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ModalDatosComprador;
