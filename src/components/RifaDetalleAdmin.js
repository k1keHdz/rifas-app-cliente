// src/components/RifaDetalleAdmin.js

import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc, collection, onSnapshot, query, orderBy, writeBatch, increment } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import HistorialVentas from "./HistorialVentas";
import GraficaVentas from "./GraficaVentas";
import FiltroFechas from "./FiltroFechas";
import RegistroVenta from "./RegistroVenta";
import ExportarInformePDF from "./ExportarInformePDF"; 

function RifaDetalleAdmin() {
  const { id: rifaId } = useParams();
  const [rifa, setRifa] = useState(null);
  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [modoGrafica, setModoGrafica] = useState("dia");
  const graficoRef = useRef(null);

  // ==========================================================
  // CORRECCIÓN: EL CÓDIGO PARA CARGAR LA RIFA FUE RESTAURADO
  // ==========================================================
  useEffect(() => {
    const docRef = doc(db, "rifas", rifaId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setRifa({ id: docSnap.id, ...docSnap.data() });
      } else {
        setRifa(null);
      }
    });
    return () => unsubscribe();
  }, [rifaId]);

  useEffect(() => {
    if (!rifaId) {
      setCargando(false);
      return;
    };
    const ventasRef = collection(db, "rifas", rifaId, "ventas");
    const q = query(ventasRef, orderBy("fechaApartado", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setVentas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setCargando(false);
    });
    return () => unsubscribe();
  }, [rifaId]);
  
  const handleConfirmarPago = async (ventaId, cantidadBoletos) => {
    if (!window.confirm(`¿Estás seguro de confirmar el pago para ${cantidadBoletos} boleto(s)? Esta acción no se puede deshacer.`)) {
      return;
    }
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
      let clave = (modoGrafica === 'semana') 
        ? `Sem. ${new Date(fecha.setDate(fecha.getDate() - fecha.getDay() + 1)).toLocaleDateString()}`
        : fecha.toLocaleDateString();
      acc[clave] = (acc[clave] || 0) + Number(venta.cantidad || 0);
      return acc;
    }, {});
    return Object.entries(agrupadas).map(([fecha, total]) => ({ fecha, total })).sort((a,b) => new Date(a.fecha.split('/').reverse().join('-')) - new Date(b.fecha.split('/').reverse().join('-')));
  }, [ventasFiltradas, modoGrafica]);

  if (cargando) return <p className="text-center mt-10">Cargando detalles de la rifa...</p>;
  if (!rifa) return <div className="text-center mt-10 text-red-600">No se encontró la rifa.</div>;
  
  return (
    <div className="p-4 max-w-7xl mx-auto">
      <Link to="/admin" className="text-blue-600 hover:underline mb-4 inline-block">← Volver al panel</Link>
      
      <div className="bg-white shadow rounded p-4 mb-6">
        <h2 className="text-2xl font-bold mb-2">{rifa.nombre}</h2>
        <p><strong>Total de boletos:</strong> {rifa.boletos} | <strong>Vendidos:</strong> {rifa.boletosVendidos || 0}</p>
      </div>

      <RegistroVenta rifa={rifa} />

      <div className="bg-gray-50 p-4 rounded-lg mt-6 border">
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
      
      <HistorialVentas 
        ventasFiltradas={ventasFiltradas} 
        mostrarTotal={true} 
        onConfirmarPago={handleConfirmarPago}
      />
    </div>
  );
}

export default RifaDetalleAdmin;