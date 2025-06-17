// src/components/RifaDetalleAdmin.js

import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, collection, onSnapshot, query, orderBy, writeBatch, increment, deleteDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { formatTicketNumber } from "../utils/rifaHelper";
import HistorialVentas from "./HistorialVentas";
import GraficaVentas from "./GraficaVentas";
import FiltroFechas from "./FiltroFechas";
import ModalVentaManual from "./ModalVentaManual";
import PanelDeExportacion from "./PanelDeExportacion";
import emailjs from '@emailjs/browser';
import EMAIL_CONFIG from '../emailjsConfig';

const VentasIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const StatsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><path d="M3 3v18h18"/><path d="m18 9-5 5-4-4-3 3"/></svg>;
const AccionesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;


function RifaDetalleAdmin() {
  const { id: rifaId } = useParams();
  const [rifa, setRifa] = useState(null);
  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [showModalVenta, setShowModalVenta] = useState(false);
  const [activeTab, setActiveTab] = useState('ventas');
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [modoGrafica, setModoGrafica] = useState("dia");
  const graficoRef = useRef(null);
  const [filtroVentas, setFiltroVentas] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const docRef = doc(db, "rifas", rifaId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) { setRifa({ id: docSnap.id, ...docSnap.data() }); } 
      else { setRifa(null); }
    });
    return () => unsubscribe();
  }, [rifaId]);

  useEffect(() => {
    if (!rifaId) { setCargando(false); return; };
    const ventasRef = collection(db, "rifas", rifaId, "ventas");
    const q = query(ventasRef, orderBy("fechaApartado", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setVentas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setCargando(false);
    }, (error) => {
      console.error("Error al cargar ventas: ", error);
      setCargando(false);
    });
    return () => unsubscribe();
  }, [rifaId]);
  
  const handleConfirmarPago = async (venta) => {
    if (!window.confirm(`¿Estás seguro de confirmar el pago para la compra ID: ${venta.idCompra || 'N/A'}?`)) { return; }
    try {
      const batch = writeBatch(db);
      const ventaRef = doc(db, "rifas", rifaId, "ventas", venta.id);
      batch.update(ventaRef, { estado: "comprado" });
      const rifaRef = doc(db, "rifas", rifaId);
      batch.update(rifaRef, { boletosVendidos: increment(venta.cantidad) });
      await batch.commit();
      alert("¡Pago confirmado con éxito en el sistema!");
    } catch (error) {
      console.error("Error CRÍTICO al confirmar el pago en Firestore:", error);
      alert("Hubo un error CRÍTICO al confirmar el pago.");
    }
  };

  const handleLiberarBoletos = async (ventaId, numeros) => {
    const boletosTexto = numeros.map(n => formatTicketNumber(n, rifa.boletos)).join(', ');
    if (!window.confirm(`¿Estás seguro de liberar los boletos [${boletosTexto}]? Esta venta se eliminará permanentemente.`)) { return; }
    try {
      const ventaRef = doc(db, "rifas", rifaId, "ventas", ventaId);
      await deleteDoc(ventaRef);
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
      const templateParams = {
        to_email: venta.comprador.email,
        to_name: `${venta.comprador.nombre} ${venta.comprador.apellidos || ''}`,
        raffle_name: venta.nombreRifa,
        ticket_numbers: boletosTexto,
        id_compra: venta.idCompra
      };
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

  const estadisticas = useMemo(() => {
    if (!rifa || !ventas) return { apartadosCount: 0, vendidosCount: 0, disponiblesCount: 0, apartadosDinero: 0, vendidosDinero: 0 };
    const vendidosCount = rifa.boletosVendidos || 0;
    const apartadosArr = ventas.filter(v => v.estado === 'apartado');
    const apartadosCount = apartadosArr.reduce((sum, v) => sum + (v.cantidad || 0), 0);
    const disponiblesCount = rifa.boletos - vendidosCount - apartadosCount;
    const vendidosDinero = vendidosCount * rifa.precio;
    const apartadosDinero = apartadosCount * rifa.precio;
    return { apartadosCount, vendidosCount, disponiblesCount, apartadosDinero, vendidosDinero };
  }, [ventas, rifa]);

  const ventasFiltradas = useMemo(() => {
    if (!ventas) return [];
    
    const terminoBusqueda = searchTerm.trim().toLowerCase();

    return ventas
      .filter(venta => {
        if (!terminoBusqueda) return true;
        const esBusquedaNumerica = !isNaN(Number(terminoBusqueda)) && terminoBusqueda !== '';
        if (esBusquedaNumerica) {
          return venta.numeros && venta.numeros.includes(parseInt(terminoBusqueda, 10));
        } else {
          return venta.idCompra && venta.idCompra.toLowerCase().includes(terminoBusqueda);
        }
      })
      .filter(v => {
        const fechaVenta = v.fechaApartado?.toDate();
        if (!fechaVenta) return true;
        if (fechaInicio && new Date(fechaVenta) < new Date(fechaInicio)) return false;
        if (fechaFin) {
          const fin = new Date(fechaFin);
          fin.setHours(23, 59, 59, 999);
          if (fechaVenta > fin) return false;
        }
        return true;
      })
      .filter(v => {
        if (filtroVentas === 'todos') return true;
        if (filtroVentas === 'pagados') return v.estado === 'comprado';
        if (filtroVentas === 'apartados') return v.estado === 'apartado';
        if (filtroVentas === 'manual') return v.estado === 'comprado' && !v.userId;
        return true;
      });
  }, [ventas, fechaInicio, fechaFin, filtroVentas, searchTerm]);

  const datosGrafico = useMemo(() => {
    if (!ventasFiltradas) return [];
    const agrupadas = ventasFiltradas.reduce((acc, venta) => {
      const fecha = venta.fechaApartado?.toDate();
      if (!fecha) return acc;
      let clave;
      if (modoGrafica === 'semana') {
        const inicioSemana = new Date(fecha);
        inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
        clave = inicioSemana.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
      } else {
        clave = fecha.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
      }
      acc[clave] = (acc[clave] || 0) + Number(venta.cantidad || 0);
      return acc;
    }, {});
    return Object.entries(agrupadas).map(([fecha, total]) => ({ fecha, total })).reverse();
  }, [ventasFiltradas, modoGrafica]);

  if (cargando) return <p className="text-center mt-10">Cargando detalles del sorteo...</p>;
  if (!rifa) return <div className="text-center mt-10 text-red-600">No se encontró el sorteo.</div>;
  
  return (
    <div className="p-4 max-w-7xl mx-auto">
      <Link to="/admin/historial-ventas" className="text-blue-600 hover:underline mb-4 inline-block">← Volver a la selección de sorteos</Link>
      
      <div className="bg-white shadow-lg rounded-xl p-6 mb-6">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">{rifa.nombre}</h1>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-2 rounded-lg bg-gray-100"><p className="text-xs text-gray-500 uppercase font-semibold">Boletos Totales</p><p className="text-2xl font-bold text-gray-800">{rifa.boletos}</p></div>
          <div className="p-2 rounded-lg bg-green-50"><p className="text-xs text-green-700 uppercase font-semibold">Vendidos</p><p className="text-xl font-bold text-green-800">{estadisticas.vendidosCount} <span className="text-sm font-normal">(${estadisticas.vendidosDinero.toLocaleString()})</span></p></div>
          <div className="p-2 rounded-lg bg-yellow-50"><p className="text-xs text-yellow-700 uppercase font-semibold">Apartados</p><p className="text-xl font-bold text-yellow-800">{estadisticas.apartadosCount} <span className="text-sm font-normal">(${estadisticas.apartadosDinero.toLocaleString()})</span></p></div>
          <div className="p-2 rounded-lg bg-blue-50"><p className="text-xs text-blue-700 uppercase font-semibold">Disponibles</p><p className="text-2xl font-bold text-blue-800">{estadisticas.disponiblesCount}</p></div>
        </div>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-2 sm:space-x-6 overflow-x-auto" aria-label="Tabs">
          <button onClick={() => setActiveTab('ventas')} className={`flex-shrink-0 flex items-center whitespace-nowrap py-3 px-2 sm:px-4 border-b-2 font-medium text-sm transition-colors ${ activeTab === 'ventas' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300' }`}><VentasIcon/> Historial de Ventas</button>
          <button onClick={() => setActiveTab('stats')} className={`flex-shrink-0 flex items-center whitespace-nowrap py-3 px-2 sm:px-4 border-b-2 font-medium text-sm transition-colors ${ activeTab === 'stats' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300' }`}><StatsIcon/> Estadísticas</button>
          <button onClick={() => setActiveTab('acciones')} className={`flex-shrink-0 flex items-center whitespace-nowrap py-3 px-2 sm:px-4 border-b-2 font-medium text-sm transition-colors ${ activeTab === 'acciones' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300' }`}><AccionesIcon/> Acciones</button>
        </nav>
      </div>

      <div className="animate-fade-in mt-6">
        {activeTab === 'ventas' && (
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <h2 className="text-xl font-bold text-gray-800">Filtros de Búsqueda</h2>
                <div className="flex-grow sm:flex-grow-0 sm:w-72">
                    <input 
                        type="text"
                        placeholder="Buscar por ID o No. Boleto..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm"
                    />
                </div>
            </div>
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Filters">
                    <button onClick={() => setFiltroVentas('todos')} className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${filtroVentas === 'todos' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Todos</button>
                    <button onClick={() => setFiltroVentas('pagados')} className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${filtroVentas === 'pagados' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Pagados</button>
                    <button onClick={() => setFiltroVentas('apartados')} className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${filtroVentas === 'apartados' ? 'border-yellow-500 text-yellow-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Apartados</button>
                    <button onClick={() => setFiltroVentas('manual')} className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${filtroVentas === 'manual' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Venta Manual</button>
                </nav>
            </div>
            <FiltroFechas fechaDesde={fechaInicio} setFechaDesde={setFechaInicio} fechaHasta={fechaFin} setFechaHasta={setFechaFin} />
            <HistorialVentas 
              ventasFiltradas={ventasFiltradas} 
              mostrarTotal={true} 
              onConfirmarPago={handleConfirmarPago}
              onLiberarBoletos={handleLiberarBoletos}
              onNotificarWhatsApp={handleNotificarWhatsApp}
              onNotificarEmail={handleNotificarEmail}
              onEnviarRecordatorio={handleEnviarRecordatorio}
              totalBoletos={rifa.boletos}
            />
          </div>
        )}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg shadow-md border space-y-4">
                <h3 className="text-lg font-bold">Filtros de Reporte</h3>
                <FiltroFechas fechaDesde={fechaInicio} setFechaDesde={setFechaInicio} fechaHasta={fechaFin} setFechaHasta={setFechaFin} />
                <PanelDeExportacion rifa={rifa} ventasFiltradas={ventasFiltradas} graficoRef={graficoRef} />
            </div>
            <GraficaVentas graficoRef={graficoRef} datosGrafico={datosGrafico} modo={modoGrafica} setModo={setModoGrafica} />
          </div>
        )}
        {activeTab === 'acciones' && (
          <div className="bg-white p-6 rounded-xl shadow-lg">
             <h2 className="text-2xl font-bold text-gray-900 mb-4">Acciones del Sorteo</h2>
             <p className="text-gray-600 mb-6">Usa estas herramientas para gestionar tu sorteo manualmente.</p>
             <button onClick={() => setShowModalVenta(true)} className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors shadow-md">
               + Registrar Venta Manual
             </button>
             <p className="text-xs text-gray-500 mt-2">Para registrar ventas en efectivo o por otros medios.</p>
          </div>
        )}
      </div>
      {showModalVenta && (
        <ModalVentaManual rifa={rifa} onClose={() => setShowModalVenta(false)} />
      )}
    </div>
  );
}

export default RifaDetalleAdmin;
