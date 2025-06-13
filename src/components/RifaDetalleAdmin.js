// src/components/RifaDetalleAdmin.js

import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc, collection, onSnapshot, query, orderBy, writeBatch, increment, deleteDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import HistorialVentas from "./HistorialVentas";
import GraficaVentas from "./GraficaVentas";
import FiltroFechas from "./FiltroFechas";
import ExportarInformePDF from "./ExportarInformePDF"; 
import ModalVentaManual from "./ModalVentaManual";

// Íconos para las pestañas
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

  // ... (TODA la lógica de useEffects y funciones handle... NO CAMBIA) ...
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
    });
    return () => unsubscribe();
  }, [rifaId]);
  const handleConfirmarPago = async (ventaId, cantidadBoletos) => {
    if (!window.confirm(`¿Estás seguro de confirmar el pago para ${cantidadBoletos} boleto(s)? Esta acción no se puede deshacer.`)) return;
    try {
      const batch = writeBatch(db);
      const ventaRef = doc(db, "rifas", rifaId, "ventas", ventaId);
      batch.update(ventaRef, { estado: "comprado" });
      const rifaRef = doc(db, "rifas", rifaId);
      batch.update(rifaRef, { boletosVendidos: increment(cantidadBoletos) });
      await batch.commit();
      alert("¡Pago confirmado con éxito!");
    } catch (error) {
      console.error("Error al confirmar el pago:", error);
      alert("Hubo un error al confirmar el pago. Revisa la consola para más detalles.");
    }
  };
  const handleLiberarBoletos = async (ventaId, numeros) => {
    const numerosTexto = numeros.map(n => String(n).padStart(5, '0')).join(', ');
    if (!window.confirm(`¿Estás seguro de liberar los boletos [${numerosTexto}]? Esta venta se eliminará permanentemente.`)) return;
    try {
      const ventaRef = doc(db, "rifas", rifaId, "ventas", ventaId);
      await deleteDoc(ventaRef);
      alert("¡Boletos liberados con éxito!");
    } catch (error) {
      console.error("Error al liberar los boletos:", error);
      alert("Hubo un error al liberar los boletos.");
    }
  };
  const ventasFiltradas = useMemo(() => {
    if (!ventas) return [];
    return ventas.filter(v => {
      const fechaVenta = v.fechaApartado?.toDate();
      if (!fechaVenta) return false;
      if (fechaInicio && new Date(fechaVenta) < new Date(fechaInicio)) return false;
      if (fechaFin) {
        const fin = new Date(fechaFin);
        fin.setHours(23, 59, 59, 999);
        if (fechaVenta > fin) return false;
      }
      return true;
    });
  }, [ventas, fechaInicio, fechaFin]);
  const datosGrafico = useMemo(() => {
    if (!ventasFiltradas) return [];
    const agrupadas = ventasFiltradas.reduce((acc, venta) => {
      const fecha = venta.fechaApartado?.toDate();
      if (!fecha) return acc;
      let clave = (modoGrafica === 'semana') ? `Sem. ${new Date(fecha.setDate(fecha.getDate() - fecha.getDay() + 1)).toLocaleDateString()}` : fecha.toLocaleDateString();
      acc[clave] = (acc[clave] || 0) + Number(venta.cantidad || 0);
      return acc;
    }, {});
    return Object.entries(agrupadas).map(([fecha, total]) => ({ fecha, total })).sort((a,b) => new Date(a.fecha.split('/').reverse().join('-')) - new Date(b.fecha.split('/').reverse().join('-')));
  }, [ventasFiltradas, modoGrafica]);


  if (cargando) return <p className="text-center mt-10">Cargando detalles de la rifa...</p>;
  if (!rifa) return <div className="text-center mt-10 text-red-600">No se encontró la rifa.</div>;
  
  return (
    <div className="p-4 max-w-7xl mx-auto">
      <Link to="/admin" className="text-blue-600 hover:underline mb-4 inline-block">← Volver al Panel Principal</Link>
      
      <div className="bg-white shadow-lg rounded-xl p-6 mb-6">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">{rifa.nombre}</h1>
        <p className="text-gray-600"><strong>Total de boletos:</strong> {rifa.boletos} | <strong>Vendidos:</strong> {rifa.boletosVendidos || 0}</p>
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
          <div>
            <HistorialVentas 
              ventasFiltradas={ventasFiltradas} 
              mostrarTotal={true} 
              onConfirmarPago={handleConfirmarPago}
              onLiberarBoletos={handleLiberarBoletos}
            />
          </div>
        )}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg shadow-md border">
                <h3 className="text-lg font-bold mb-2">Filtros y Reportes</h3>
                <FiltroFechas fechaDesde={fechaInicio} setFechaDesde={setFechaInicio} fechaHasta={fechaFin} setFechaHasta={setFechaFin} />
                <ExportarInformePDF
                    graficoRef={graficoRef}
                    rifaId={rifaId}
                    nombreRifa={rifa.nombre}
                    ventasFiltradas={ventasFiltradas}
                />
            </div>
            <GraficaVentas graficoRef={graficoRef} datosGrafico={datosGrafico} modo={modoGrafica} setModo={setModoGrafica} />
          </div>
        )}
        {activeTab === 'acciones' && (
          <div className="bg-white p-6 rounded-xl shadow-lg">
             <h2 className="text-2xl font-bold text-gray-900 mb-4">Acciones de Rifa</h2>
             <p className="text-gray-600 mb-6">Usa estas herramientas para gestionar tu rifa manualmente.</p>
             <button 
                onClick={() => setShowModalVenta(true)}
                className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors shadow-md"
              >
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