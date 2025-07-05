// src/pages/admin/RifaDetalleAdminPage.js

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, collection, onSnapshot, query, orderBy, getDocs, limit, startAfter, where, getCountFromServer, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import HistorialVentas from "../../components/admin/HistorialVentas";
import GraficaVentas from "../../components/admin/GraficaVentas";
import FiltroFechas from "../../components/admin/FiltroFechas";
import PanelDeExportacion from "../../components/admin/PanelDeExportacion";
import ModalVentaManual from "../../components/modals/ModalVentaManual";
import { useBoletos } from "../../hooks/useBoletos";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import emailjs from '@emailjs/browser';
import EMAIL_CONFIG from '../../emailjsConfig';
import { formatTicketNumber } from "../../utils/rifaHelper";
import ConfirmationModal from "../../components/modals/ConfirmationModal";
import Alerta from "../../components/ui/Alerta";

const VentasIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const StatsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><path d="M3 3v18h18"/><path d="m18 9-5 5-4-4-3 3"/></svg>;
const AccionesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;


function RifaDetalleAdminPage() {
    const { id: rifaId } = useParams();
    const [rifa, setRifa] = useState(null);
    const [activeTab, setActiveTab] = useState('ventas');
    const [ventas, setVentas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [ventasParaStats, setVentasParaStats] = useState([]);
    const [cargandoStats, setCargandoStats] = useState(false);
    const [filtroTabla, setFiltroTabla] = useState('todos');
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [searchTerm, setSearchTerm] = useState('');
    const [paginaActual, setPaginaActual] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(0);
    const [ventasPorPagina] = useState(25);
    const lastVisible = useRef(null);
    const [showModalVenta, setShowModalVenta] = useState(false);
    const [showMoney, setShowMoney] = useState(true);
    const graficoRef = useRef(null);
    const [apartadosRealesCount, setApartadosRealesCount] = useState(0);

    const [confirmationState, setConfirmationState] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
    const [pageFeedback, setPageFeedback] = useState({ msg: '', type: '' });
    const feedbackTimeoutRef = useRef(null);

    const { 
        boletosSeleccionados, 
        setBoletosSeleccionados,
        boletosOcupados,
        agregarBoletosEspecificos,
    } = useBoletos(rifaId);

    const showFeedback = useCallback((msg, type = 'info', duration = 4000) => {
        if (feedbackTimeoutRef.current) {
            clearTimeout(feedbackTimeoutRef.current);
        }
        setPageFeedback({ msg, type });
        feedbackTimeoutRef.current = setTimeout(() => {
            setPageFeedback({ msg: '', type: '' });
        }, duration);
    }, []);

    const handleConfirmarPago = useCallback((venta) => {
        setConfirmationState({
            isOpen: true,
            title: 'Confirmar Pago',
            message: `¿Estás seguro que deseas confirmar el pago para la compra ID: ${venta.idCompra || 'N/A'}? Esta acción es irreversible.`,
            confirmText: 'Sí, Confirmar',
            onConfirm: async () => {
                try {
                    const ventaRef = doc(db, "rifas", rifaId, "ventas", venta.id);
                    await updateDoc(ventaRef, { estado: "comprado" });
                    showFeedback('Pago confirmado con éxito.', 'exito');
                } catch (error) {
                    console.error("Error CRÍTICO al confirmar el pago en Firestore:", error);
                    showFeedback('Hubo un error CRÍTICO al confirmar el pago.', 'error');
                }
                setConfirmationState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
            }
        });
    }, [rifaId, showFeedback]);

    const handleLiberarBoletos = useCallback((venta) => {
        const boletosTexto = venta.numeros.map(n => formatTicketNumber(n, rifa?.boletos)).join(', ');
        setConfirmationState({
            isOpen: true,
            title: 'Liberar Boletos',
            message: `¿Estás seguro que deseas liberar los boletos [${boletosTexto}]? Esta venta se eliminará permanentemente.`,
            confirmText: 'Sí, Liberar',
            onConfirm: async () => {
                try {
                    const ventaRef = doc(db, "rifas", rifaId, "ventas", venta.id);
                    await deleteDoc(ventaRef);
                    showFeedback('Boletos liberados con éxito.', 'exito');
                } catch (error) {
                    console.error("Error al liberar los boletos:", error);
                    showFeedback('Hubo un error al liberar los boletos.', 'error');
                }
                setConfirmationState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
            }
        });
    }, [rifaId, rifa?.boletos, showFeedback]);
    
    const handleNotificarWhatsApp = useCallback((venta) => {
        const boletosTexto = venta.numeros.map(n => formatTicketNumber(n, rifa?.boletos)).join(', ');
        let mensajeWhats = `¡Felicidades, ${venta.comprador.nombre}! 🎉 Tu pago para: "${venta.nombreRifa}" ha sido confirmado.\n\nID de Compra: *${venta.idCompra}*\n\n*Tus números:* ${boletosTexto}\n\n¡Te deseamos mucha suerte en el sorteo!`;
        const waUrl = `https://wa.me/52${venta.comprador.telefono}?text=${encodeURIComponent(mensajeWhats)}`;
        window.open(waUrl, '_blank');
    }, [rifa?.boletos]);

    const handleNotificarEmail = useCallback((venta) => {
        const emailValido = venta.comprador.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(venta.comprador.email);
        if (!emailValido) { 
            showFeedback(`El correo del cliente (${venta.comprador.email || 'No proporcionado'}) no es válido.`, 'error');
            return; 
        }
        
        setConfirmationState({
            isOpen: true,
            title: 'Enviar Correo',
            message: `¿Enviar el comprobante por correo a ${venta.comprador.email}?`,
            confirmText: 'Sí, Enviar',
            onConfirm: async () => {
                try {
                    const boletosTexto = venta.numeros.map(n => formatTicketNumber(n, rifa?.boletos)).join(', ');
                    const templateParams = { to_email: venta.comprador.email, to_name: `${venta.comprador.nombre} ${venta.comprador.apellidos || ''}`, raffle_name: venta.nombreRifa, ticket_numbers: boletosTexto, id_compra: venta.idCompra };
                    await emailjs.send(EMAIL_CONFIG.serviceID, EMAIL_CONFIG.templateID, templateParams, EMAIL_CONFIG.publicKey);
                    showFeedback('Correo de confirmación enviado exitosamente.', 'exito');
                } catch (error) {
                    console.error("Fallo al enviar el correo (EmailJS):", error);
                    showFeedback(`AVISO: No se pudo enviar el correo. Error: ${error.text || 'Revisa la consola.'}`, 'error');
                }
                setConfirmationState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
            }
        });
    }, [rifa?.boletos, showFeedback]);
    
    const handleEnviarRecordatorio = useCallback((venta) => {
        const boletosTexto = venta.numeros.map(n => formatTicketNumber(n, rifa?.boletos)).join(', ');
        const nombreCliente = venta.comprador.nombre;
        const nombreSorteo = venta.nombreRifa;
        let mensaje = `¡Hola, ${nombreCliente}! 👋 Te escribimos de Sorteos El Primo.\n\nNotamos que tu apartado para: "${nombreSorteo}" con los boletos *${boletosTexto}* ha expirado.\n\n¡No te preocupes! Aún podrías tener la oportunidad de participar. Contáctanos por este medio para ver si tus boletos siguen disponibles y ayudarte a completar la compra. ¡No te quedes fuera!`;
        const waUrl = `https://wa.me/52${venta.comprador.telefono}?text=${encodeURIComponent(mensaje)}`;
        window.open(waUrl, '_blank');
    }, [rifa?.boletos]);

    useEffect(() => {
        if (!rifaId || activeTab !== 'ventas') return;
    
        const cargarVentas = async () => {
            setCargando(true);
            const ventasRef = collection(db, "rifas", rifaId, "ventas");
            const term = searchTerm.trim();
    
            if (term) {
                try {
                    const esNumerico = !isNaN(Number(term));
                    let searchQuery;
                    
                    if (esNumerico) {
                        searchQuery = query(ventasRef, where("numeros", "array-contains", parseInt(term, 10)));
                    } else {
                        searchQuery = query(ventasRef, where("idCompra", "==", term.toUpperCase()));
                    }
    
                    const snapshot = await getDocs(searchQuery);
                    const ventasData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                    setVentas(ventasData);
                    setTotalPaginas(1);
                    setPaginaActual(1);

                } catch (error) {
                    console.error("Error al buscar ventas:", error);
                    setVentas([]);
                } finally {
                    setCargando(false);
                }
            } else {
                try {
                    let baseQuery = query(ventasRef);
    
                    if (fechaInicio) baseQuery = query(baseQuery, where("fechaApartado", ">=", new Date(fechaInicio)));
                    if (fechaFin) {
                        const fin = new Date(fechaFin);
                        fin.setHours(23, 59, 59, 999);
                        baseQuery = query(baseQuery, where("fechaApartado", "<=", fin));
                    }
                    if (filtroTabla === 'manuales') {
                        baseQuery = query(baseQuery, where("origen", "==", "manual"));
                    } else if (filtroTabla === 'apartados') {
                        baseQuery = query(baseQuery, where("estado", "==", "apartado"));
                    }
    
                    const countSnapshot = await getCountFromServer(baseQuery);
                    setTotalPaginas(Math.ceil(countSnapshot.data().count / ventasPorPagina));
    
                    let finalQuery = query(baseQuery, orderBy("fechaApartado", "desc"));
                    if (paginaActual > 1 && lastVisible.current) {
                        finalQuery = query(finalQuery, startAfter(lastVisible.current));
                    }
                    finalQuery = query(finalQuery, limit(ventasPorPagina));
    
                    const snapshot = await getDocs(finalQuery);
                    const ventasData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                    setVentas(ventasData);
                    lastVisible.current = snapshot.docs[snapshot.docs.length - 1] || null;

                } catch (error) {
                    console.error("Error al cargar ventas paginadas:", error);
                    setVentas([]);
                } finally {
                    setCargando(false);
                }
            }
        };
    
        cargarVentas();
    
    }, [rifaId, activeTab, paginaActual, searchTerm, fechaInicio, filtroTabla, ventasPorPagina]);

    useEffect(() => {
        if (!rifaId) return;

        const ventasRef = collection(db, "rifas", rifaId, "ventas");
        const q = query(ventasRef); 

        const unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                const changedDoc = { id: change.doc.id, ...change.doc.data() };
                
                if (change.type === "added") {
                    setVentas(prevVentas => {
                        if (prevVentas.some(v => v.id === changedDoc.id)) {
                            return prevVentas;
                        }
                        const newVentas = [...prevVentas, changedDoc];
                        newVentas.sort((a, b) => {
                            const timeA = a.fechaApartado?.toMillis() || 0;
                            const timeB = b.fechaApartado?.toMillis() || 0;
                            return timeB - timeA;
                        });
                        return newVentas;
                    });
                }
                if (change.type === "modified") {
                    setVentas(prevVentas => prevVentas.map(venta => 
                        venta.id === changedDoc.id ? changedDoc : venta
                    ));
                }
                if (change.type === "removed") {
                    setVentas(prevVentas => prevVentas.filter(venta => venta.id !== changedDoc.id));
                }
            });
        }, (error) => {
            console.error("Error en listener de tiempo real:", error);
        });

        return () => unsubscribe();
    }, [rifaId]);


    useEffect(() => {
        if (!rifaId || activeTab !== 'stats') { setVentasParaStats([]); return; }
        const fetchVentasCompletas = async () => {
            setCargandoStats(true);
            let q = query(collection(db, "rifas", rifaId, "ventas"));
            if (fechaInicio) q = query(q, where("fechaApartado", ">=", new Date(fechaInicio)));
            if (fechaFin) { const fin = new Date(fechaFin); fin.setHours(23, 59, 59, 999); q = query(q, where("fechaApartado", "<=", fin));}
            try {
                const snapshot = await getDocs(q);
                setVentasParaStats(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
            } catch (error) { console.error("Error al cargar datos para estadísticas:", error); }
            finally { setCargandoStats(false); }
        };
        fetchVentasCompletas();
    }, [rifaId, activeTab, fechaInicio, fechaFin]);

    useEffect(() => {
        if (!rifaId) return;

        const docRef = doc(db, "rifas", rifaId);
        const unsubscribeRifa = onSnapshot(docRef, (docSnap) => setRifa(docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null));
        
        const ventasRef = collection(db, "rifas", rifaId, "ventas");
        const unsubscribeVentasGenerales = onSnapshot(query(ventasRef), (snapshot) => {
            let tempApartadosCount = 0;
            snapshot.forEach(doc => {
                const venta = doc.data();
                if (venta.estado === 'apartado') {
                    tempApartadosCount += venta.cantidad || 0;
                }
            });
            setApartadosRealesCount(tempApartadosCount);
        });

        return () => { unsubscribeRifa(); unsubscribeVentasGenerales(); };
    }, [rifaId]);

    useEffect(() => {
        setPaginaActual(1);
        lastVisible.current = null;
    }, [searchTerm, fechaInicio, fechaFin, filtroTabla]);
    
    const handleAgregarMultiplesManual = useCallback((cantidad) => {
        if (!rifa) return;
        agregarBoletosEspecificos(Array.from({length: cantidad}));
    }, [rifa, agregarBoletosEspecificos]);
    
    const estadisticasGenerales = useMemo(() => {
        if (!rifa) return { vendidosCount: 0, apartadosCount: 0, disponiblesCount: 0, vendidosDinero: 0, apartadosDinero: 0, porcentajeVendido: 0 };
        const vendidosCount = rifa.boletosVendidos || 0;
        const apartadosCount = apartadosRealesCount;
        const disponiblesCount = rifa.boletos - vendidosCount - apartadosCount;
        return { vendidosCount, apartadosCount, disponiblesCount, vendidosDinero: vendidosCount * rifa.precio, apartadosDinero: apartadosCount * rifa.precio, porcentajeVendido: rifa.boletos > 0 ? (vendidosCount / rifa.boletos) * 100 : 0 };
    }, [rifa, apartadosRealesCount]);
    
    const [modoGrafica, setModoGrafica] = useState("dia");
    const datosGrafico = useMemo(() => {
        if (!ventasParaStats || ventasParaStats.length === 0) return [];
        const agrupadas = ventasParaStats.reduce((acc, venta) => {
            const fecha = venta.fechaApartado?.toDate();
            if (!fecha) return acc;
            let clave;
            if (modoGrafica === 'semana') { const inicioSemana = new Date(fecha); inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay()); clave = inicioSemana.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
            } else { clave = fecha.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });}
            acc[clave] = (acc[clave] || 0) + Number(venta.cantidad || 0);
            return acc;
        }, {});
        return Object.entries(agrupadas).map(([fecha, total]) => ({ fecha, total })).reverse();
    }, [ventasParaStats, modoGrafica]);

    const handleCloseVentaModal = useCallback(() => {
        setShowModalVenta(false);
    }, []);

    if (!rifa) return <div className="text-center p-10">{cargando ? 'Cargando...' : 'No se encontró el sorteo.'}</div>;

    const TabButton = ({ active, onClick, children }) => ( <button onClick={onClick} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${active ? 'bg-accent-primary text-white shadow' : 'bg-background-dark text-text-subtle hover:bg-border-color'}`}>{children}</button>);

    return (
        <div className="p-4 max-w-7xl mx-auto min-h-screen relative">
            
            <div className="fixed top-20 right-5 z-50 w-full max-w-sm">
                {pageFeedback.msg && (
                    <Alerta 
                        mensaje={pageFeedback.msg} 
                        tipo={pageFeedback.type} 
                        onClose={() => setPageFeedback({ msg: '', type: '' })} 
                    />
                )}
            </div>

            <Link to="/admin/historial-ventas" className="text-accent-primary hover:underline mb-4 inline-block">← Volver a la selección de sorteos</Link>
            
            <div className="bg-background-light border border-border-color shadow-lg rounded-xl p-6 mb-6">
                <div className="flex justify-between items-start mb-4"><h1 className="text-3xl font-bold">{rifa.nombre}</h1><button onClick={() => setShowMoney(!showMoney)} className="text-text-subtle hover:text-accent-primary p-2">{showMoney ? <FaEyeSlash size={20}/> : <FaEye size={20}/>}</button></div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 text-center">
                    <div className="p-3 rounded-lg bg-background-dark"><p className="text-xs text-text-subtle uppercase font-semibold">Boletos Totales</p><p className="text-2xl font-bold">{rifa.boletos.toLocaleString()}</p></div>
                    <div className="p-3 rounded-lg bg-green-500/10"><p className="text-xs text-green-500 uppercase font-semibold">Vendidos</p><p className="text-xl font-bold text-green-400">{estadisticasGenerales.vendidosCount.toLocaleString()} {showMoney && <span className="text-sm font-normal">(${estadisticasGenerales.vendidosDinero.toLocaleString()})</span>}</p></div>
                    <div className="p-3 rounded-lg bg-amber-500/10"><p className="text-xs text-amber-500 uppercase font-semibold">Apartados</p><p className="text-xl font-bold text-amber-400">{estadisticasGenerales.apartadosCount.toLocaleString()} {showMoney && <span className="text-sm font-normal">(${estadisticasGenerales.apartadosDinero.toLocaleString()})</span>}</p></div>
                    <div className="p-3 rounded-lg bg-indigo-500/10"><p className="text-xs text-indigo-400 uppercase font-semibold">Disponibles</p><p className="text-2xl font-bold text-indigo-300">{estadisticasGenerales.disponiblesCount.toLocaleString()}</p></div>
                    <div className="p-3 rounded-lg bg-background-dark"><p className="text-xs text-text-subtle uppercase font-semibold">Progreso</p><p className="text-2xl font-bold">{estadisticasGenerales.porcentajeVendido.toFixed(1)}%</p></div>
                </div>
            </div>

            <div className="border-b border-border-color mb-6">
                <nav className="-mb-px flex space-x-2 sm:space-x-6 overflow-x-auto" aria-label="Tabs">
                    <button onClick={() => setActiveTab('ventas')} className={`flex-shrink-0 flex items-center whitespace-nowrap py-3 px-2 sm:px-4 border-b-2 font-medium text-sm transition-colors ${ activeTab === 'ventas' ? 'border-accent-primary text-accent-primary' : 'border-transparent text-text-subtle hover:border-border-color' }`}><VentasIcon/> Historial de Ventas</button>
                    <button onClick={() => setActiveTab('stats')} className={`flex-shrink-0 flex items-center whitespace-nowrap py-3 px-2 sm:px-4 border-b-2 font-medium text-sm transition-colors ${ activeTab === 'stats' ? 'border-accent-primary text-accent-primary' : 'border-transparent text-text-subtle hover:border-border-color' }`}><StatsIcon/> Estadísticas</button>
                    <button onClick={() => setActiveTab('acciones')} className={`flex-shrink-0 flex items-center whitespace-nowrap py-3 px-2 sm:px-4 border-b-2 font-medium text-sm transition-colors ${ activeTab === 'acciones' ? 'border-accent-primary text-accent-primary' : 'border-transparent text-text-subtle hover:border-border-color' }`}><AccionesIcon/> Acciones</button>
                </nav>
            </div>

            <div className="animate-fade-in mt-6">
                {activeTab === 'ventas' && (
                    <div className="bg-background-light p-4 sm:p-6 rounded-xl shadow-lg border border-border-color">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                            <h2 className="text-xl font-bold">Filtros y Búsqueda</h2>
                            <div className="flex-grow sm:flex-grow-0 sm:w-auto flex gap-2">
                                <input type="text" placeholder="Buscar por ID o No. Boleto..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field w-full sm:w-64"/>
                                {(searchTerm || fechaInicio || fechaFin) && <button type="button" onClick={() => { setSearchTerm(''); setFechaInicio(''); setFechaFin(''); }} className="btn btn-secondary">Limpiar</button>}
                            </div>
                        </div>
                        {!searchTerm && (<div className="mb-4 p-2 rounded-lg bg-background-dark/50"><div className="flex items-center gap-2">
                            <TabButton active={filtroTabla === 'todos'} onClick={() => setFiltroTabla('todos')}>Todos</TabButton>
                            <TabButton active={filtroTabla === 'manuales'} onClick={() => setFiltroTabla('manuales')}>Ventas Manuales</TabButton>
                            <TabButton active={filtroTabla === 'apartados'} onClick={() => setFiltroTabla('apartados')}>Apartados</TabButton>
                        </div></div>)}
                        {!searchTerm && <FiltroFechas fechaDesde={fechaInicio} setFechaDesde={setFechaInicio} fechaHasta={fechaFin} setFechaHasta={setFechaFin} />}
                        <HistorialVentas ventas={ventas} showMoney={showMoney} onConfirmarPago={handleConfirmarPago} onLiberarBoletos={handleLiberarBoletos} onNotificarWhatsApp={handleNotificarWhatsApp} onNotificarEmail={handleNotificarEmail} onEnviarRecordatorio={handleEnviarRecordatorio} totalBoletos={rifa?.boletos || 0} onPaginaAnterior={() => setPaginaActual(p => Math.max(1, p - 1))} onPaginaSiguiente={() => setPaginaActual(p => p + 1)} paginaActual={paginaActual} totalPaginas={totalPaginas} cargando={cargando} isSearching={!!searchTerm}/>
                    </div>
                )}
                {activeTab === 'stats' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-background-light p-4 rounded-lg shadow-md border border-border-color space-y-4">
                            <h3 className="text-lg font-bold">Filtros de Reporte</h3><FiltroFechas fechaDesde={fechaInicio} setFechaDesde={setFechaInicio} fechaHasta={fechaFin} setFechaHasta={setFechaFin} /><PanelDeExportacion rifa={rifa} ventasFiltradas={ventasParaStats} graficoRef={graficoRef} />
                        </div>
                        <GraficaVentas graficoRef={graficoRef} datosGrafico={datosGrafico} modo={modoGrafica} setModo={setModoGrafica} cargando={cargandoStats} />
                    </div>
                )}
                {activeTab === 'acciones' && (
                       <div className="bg-background-light p-6 rounded-xl shadow-lg border border-border-color">
                           <h2 className="text-2xl font-bold mb-4">Acciones del Sorteo</h2><p className="text-text-subtle mb-6">Usa estas herramientas para gestionar tu sorteo manualmente.</p>
                           <button onClick={() => { setBoletosSeleccionados([]); setShowModalVenta(true); }} className="btn bg-success text-white hover:bg-green-700">+ Registrar Venta Manual</button>
                           <p className="text-xs text-text-subtle mt-2">Para registrar ventas en efectivo o por otros medios.</p>
                       </div>
                )}
            </div>
            {showModalVenta && ( <ModalVentaManual rifa={rifa} onClose={handleCloseVentaModal} boletosOcupados={boletosOcupados} boletosSeleccionados={boletosSeleccionados} setBoletosSeleccionados={setBoletosSeleccionados} onAgregarMultiples={handleAgregarMultiplesManual}/> )}
            
            <ConfirmationModal
                isOpen={confirmationState.isOpen}
                title={confirmationState.title}
                message={confirmationState.message}
                confirmText={confirmationState.confirmText}
                onConfirm={confirmationState.onConfirm}
                onClose={() => setConfirmationState({ isOpen: false, title: '', message: '', onConfirm: () => {} })}
            />
        </div>
    );
}

export default RifaDetalleAdminPage;
