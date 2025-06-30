import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, collection, onSnapshot, query, orderBy, getDocs, limit, startAfter, where, getCountFromServer, writeBatch, increment, deleteDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import HistorialVentas from "./HistorialVentas";
import GraficaVentas from "./GraficaVentas";
import FiltroFechas from "./FiltroFechas";
import ModalVentaManual from "./ModalVentaManual";
import PanelDeExportacion from "./PanelDeExportacion";
import { useBoletos } from "../hooks/useBoletos";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import emailjs from '@emailjs/browser';
import EMAIL_CONFIG from '../emailjsConfig';
import { formatTicketNumber } from "../utils/rifaHelper";

// --- Íconos (Sin cambios) ---
const VentasIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const StatsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><path d="M3 3v18h18"/><path d="m18 9-5 5-4-4-3 3"/></svg>;
const AccionesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;


function RifaDetalleAdmin() {
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
    const [ventasPorPagina] = useState(50);
    const lastVisible = useRef(null);
    const [showModalVenta, setShowModalVenta] = useState(false);
    const [showMoney, setShowMoney] = useState(true);
    const graficoRef = useRef(null);
    const [boletosOcupados, setBoletosOcupados] = useState(new Map());
    const [apartadosRealesCount, setApartadosRealesCount] = useState(0);

    const { 
        boletosSeleccionados: boletosVentaManual, 
        setBoletosSeleccionados: setBoletosVentaManual,
        agregarBoletosEspecificos: agregarBoletosVentaManual
    } = useBoletos();

    const handleConfirmarPago = async (venta) => {
        if (!window.confirm(`¿Estás seguro de confirmar el pago para la compra ID: ${venta.idCompra || 'N/A'}?`)) { return; }
        try {
            const batch = writeBatch(db);
            const ventaRef = doc(db, "rifas", rifaId, "ventas", venta.id);
            batch.update(ventaRef, { estado: "comprado" });
            const rifaRef = doc(db, "rifas", rifaId);
            batch.update(rifaRef, { boletosVendidos: increment(venta.cantidad) });
            await batch.commit();
            setVentas(currentVentas => currentVentas.map(v => v.id === venta.id ? { ...v, estado: 'comprado' } : v));
            alert("¡Pago confirmado con éxito en el sistema!");
        } catch (error) {
            console.error("Error CRÍTICO al confirmar el pago en Firestore:", error);
            alert("Hubo un error CRÍTICO al confirmar el pago.");
        }
    };

    const handleLiberarBoletos = async (venta) => {
        const boletosTexto = venta.numeros.map(n => formatTicketNumber(n, rifa.boletos)).join(', ');
        if (!window.confirm(`¿Estás seguro de liberar los boletos [${boletosTexto}]? Esta venta se eliminará permanentemente.`)) { return; }
        try {
            const batch = writeBatch(db);
            const ventaRef = doc(db, "rifas", rifaId, "ventas", venta.id);
            batch.delete(ventaRef);
            const rifaRef = doc(db, "rifas", rifaId);
            if (venta.estado === 'apartado') {
                batch.update(rifaRef, { boletosApartados: increment(-venta.cantidad) });
            } else if (venta.estado === 'comprado') {
                batch.update(rifaRef, { boletosVendidos: increment(-venta.cantidad) });
            }
            await batch.commit();
            setVentas(currentVentas => currentVentas.filter(v => v.id !== venta.id));
            alert("¡Boletos liberados con éxito!");
        } catch (error) {
            console.error("Error al liberar los boletos:", error);
            alert("Hubo un error al liberar los boletos.");
        }
    };
    
    const handleNotificarWhatsApp = (venta) => {
        const boletosTexto = venta.numeros.map(n => formatTicketNumber(n, rifa.boletos)).join(', ');
        let mensajeWhats = `¡Felicidades, ${venta.comprador.nombre}! 🎉 Tu pago para el sorteo "${venta.nombreRifa}" ha sido confirmado.\n\nID de Compra: *${venta.idCompra}*\n\n*Tus números:* ${boletosTexto}\n\n¡Te deseamos mucha suerte en el sorteo!`;
        const waUrl = `https://wa.me/52${venta.comprador.telefono}?text=${encodeURIComponent(mensajeWhats)}`;
        window.open(waUrl, '_blank');
    };

    const handleNotificarEmail = async (venta) => {
        const emailValido = venta.comprador.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(venta.comprador.email);
        if (!emailValido) { return alert(`El correo del cliente (${venta.comprador.email || 'No proporcionado'}) no es válido.`); }
        if (!window.confirm(`¿Enviar el comprobante por correo a ${venta.comprador.email}?`)) return;
        try {
            const boletosTexto = venta.numeros.map(n => formatTicketNumber(n, rifa.boletos)).join(', ');
            const templateParams = { to_email: venta.comprador.email, to_name: `${venta.comprador.nombre} ${venta.comprador.apellidos || ''}`, raffle_name: venta.nombreRifa, ticket_numbers: boletosTexto, id_compra: venta.idCompra };
            await emailjs.send(EMAIL_CONFIG.serviceID, EMAIL_CONFIG.templateID, templateParams, EMAIL_CONFIG.publicKey);
            alert("Correo de confirmación enviado exitosamente.");
        } catch (error) {
            console.error("Fallo al enviar el correo (EmailJS):", error);
            alert(`AVISO: No se pudo enviar el correo.\nError: ${error.text || 'Revisa la consola y tu configuración de EmailJS.'}`);
        }
    };
    
    const handleEnviarRecordatorio = (venta) => {
        const boletosTexto = venta.numeros.map(n => formatTicketNumber(n, rifa.boletos)).join(', ');
        const nombreCliente = venta.comprador.nombre;
        const nombreSorteo = venta.nombreRifa;
        let mensaje = `¡Hola, ${nombreCliente}! 👋 Te escribimos de Sorteos App.\n\nNotamos que tu apartado para el sorteo "${nombreSorteo}" con los boletos *${boletosTexto}* ha expirado.\n\n¡No te preocupes! Aún podrías tener la oportunidad de participar. Contáctanos por este medio para ver si tus boletos siguen disponibles y ayudarte a completar la compra. ¡No te quedes fuera!`;
        const waUrl = `https://wa.me/52${venta.comprador.telefono}?text=${encodeURIComponent(mensaje)}`;
        window.open(waUrl, '_blank');
    };

    useEffect(() => {
        if (!rifaId || activeTab !== 'ventas') return;
        const fetchVentas = async () => {
            setCargando(true);
            const ventasRef = collection(db, "rifas", rifaId, "ventas");
            let dataQuery;
            const term = searchTerm.trim();
            if (term) {
                const esNumerico = !isNaN(Number(term));
                dataQuery = query(ventasRef, where( esNumerico ? "numeros" : "idCompra", esNumerico ? "array-contains" : "==", esNumerico ? parseInt(term, 10) : term.toUpperCase()));
                setTotalPaginas(1);
                setPaginaActual(1);
            } else {
                let baseQuery = query(ventasRef);
                if (fechaInicio) baseQuery = query(baseQuery, where("fechaApartado", ">=", new Date(fechaInicio)));
                if (fechaFin) { const fin = new Date(fechaFin); fin.setHours(23, 59, 59, 999); baseQuery = query(baseQuery, where("fechaApartado", "<=", fin));}
                if (filtroTabla === 'manuales') { baseQuery = query(baseQuery, where("origen", "==", "manual"));
                } else if (filtroTabla === 'apartados') { baseQuery = query(baseQuery, where("estado", "==", "apartado"));}
                try {
                    const countSnapshot = await getCountFromServer(baseQuery);
                    setTotalPaginas(Math.ceil(countSnapshot.data().count / ventasPorPagina));
                } catch (error) { console.error("Error al contar ventas (posiblemente falta un índice en Firestore):", error); setTotalPaginas(0); }
                dataQuery = query(baseQuery, orderBy("fechaApartado", "desc"));
                if (paginaActual > 1 && lastVisible.current) { dataQuery = query(dataQuery, startAfter(lastVisible.current)); }
                dataQuery = query(dataQuery, limit(ventasPorPagina));
            }
            try {
                const snapshot = await getDocs(dataQuery);
                setVentas(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
                if (!term) { lastVisible.current = snapshot.docs[snapshot.docs.length - 1] || null;}
            } catch (error) { console.error("Error al obtener ventas (posiblemente falta un índice en Firestore):", error); setVentas([]);}
            finally { setCargando(false); }
        };
        fetchVentas();
    }, [rifaId, activeTab, paginaActual, searchTerm, fechaInicio, fechaFin, filtroTabla, ventasPorPagina]);

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

    // --- EFECTO DE SINCRONIZACIÓN CORREGIDO ---
    useEffect(() => {
        const docRef = doc(db, "rifas", rifaId);
        const unsubscribeRifa = onSnapshot(docRef, (docSnap) => setRifa(docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null));
        
        // Este listener ahora se encarga de AMBAS tareas:
        // 1. Poblar el mapa completo de boletosOcupados.
        // 2. Contar el total de boletos apartados.
        const ventasRef = collection(db, "rifas", rifaId, "ventas");
        const unsubscribeVentas = onSnapshot(query(ventasRef), (snapshot) => {
            const ocupados = new Map();
            let tempApartadosCount = 0;
            snapshot.forEach(doc => {
                const venta = doc.data();
                if (venta.numeros) {
                    venta.numeros.forEach(num => ocupados.set(Number(num), venta.estado));
                }
                if (venta.estado === 'apartado') {
                    tempApartadosCount += venta.cantidad || 0;
                }
            });
            setBoletosOcupados(ocupados); // Actualiza el mapa COMPLETO
            setApartadosRealesCount(tempApartadosCount); // Actualiza el contador de apartados
        });

        return () => { unsubscribeRifa(); unsubscribeVentas(); };
    }, [rifaId]);

    useEffect(() => {
        const handler = setTimeout(() => { if (paginaActual !== 1) setPaginaActual(1); lastVisible.current = null;}, 500);
        return () => clearTimeout(handler);
    }, [searchTerm, fechaInicio, fechaFin, filtroTabla]);
    
    const handleAgregarMultiplesManual = useCallback((cantidad) => {
        if (!rifa) return;
        const todosLosNumeros = Array.from({ length: rifa.boletos }, (_, i) => i);
        const boletosDisponibles = todosLosNumeros.filter(num => !boletosOcupados.has(num) && !boletosVentaManual.includes(num));
        if (boletosDisponibles.length < cantidad) {
            alert(`¡No hay suficientes boletos disponibles! Solo quedan ${boletosDisponibles.length}.`);
            agregarBoletosVentaManual(boletosDisponibles); return;
        }
        for (let i = boletosDisponibles.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [boletosDisponibles[i], boletosDisponibles[j]] = [boletosDisponibles[j], boletosDisponibles[i]];}
        const nuevosBoletos = boletosDisponibles.slice(0, cantidad);
        agregarBoletosVentaManual(nuevosBoletos);
    }, [rifa, boletosOcupados, boletosVentaManual, agregarBoletosVentaManual]);
    
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

    if (!rifa) return <div className="text-center p-10">{cargando ? 'Cargando...' : 'No se encontró el sorteo.'}</div>;

    const TabButton = ({ active, onClick, children }) => ( <button onClick={onClick} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${active ? 'bg-accent-primary text-white shadow' : 'bg-background-dark text-text-subtle hover:bg-border-color'}`}>{children}</button>);

    return (
        <div className="p-4 max-w-7xl mx-auto min-h-screen">
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
                        <HistorialVentas ventas={ventas} showMoney={showMoney} onConfirmarPago={handleConfirmarPago} onLiberarBoletos={handleLiberarBoletos} onNotificarWhatsApp={handleNotificarWhatsApp} onNotificarEmail={handleNotificarEmail} onEnviarRecordatorio={handleEnviarRecordatorio} totalBoletos={rifa.boletos} onPaginaAnterior={() => setPaginaActual(p => Math.max(1, p - 1))} onPaginaSiguiente={() => setPaginaActual(p => p + 1)} paginaActual={paginaActual} totalPaginas={totalPaginas} cargando={cargando} isSearching={!!searchTerm}/>
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
                        <button onClick={() => { setBoletosVentaManual([]); setShowModalVenta(true); }} className="btn bg-success text-white hover:bg-green-700">+ Registrar Venta Manual</button>
                        <p className="text-xs text-text-subtle mt-2">Para registrar ventas en efectivo o por otros medios.</p>
                    </div>
                )}
            </div>
            {showModalVenta && ( <ModalVentaManual rifa={rifa} onClose={() => setShowModalVenta(false)} boletosOcupados={boletosOcupados} boletosSeleccionados={boletosVentaManual} setBoletosSeleccionados={setBoletosVentaManual} onAgregarMultiples={handleAgregarMultiplesManual}/> )}
        </div>
    );
}

export default RifaDetalleAdmin;
