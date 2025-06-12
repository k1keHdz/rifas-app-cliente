// src/components/RifasPublic.js

import { useEffect, useState } from "react";
// ==================================================================
// INICIO DE CAMBIOS: Importaciones adicionales para paginación
// ==================================================================
import { collection, onSnapshot, query, where, orderBy, limit, startAfter, getDocs } from "firebase/firestore";
// ==================================================================
// FIN DE CAMBIOS
// ==================================================================
import { Link } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";
import { getDrawConditionText, getTicketCounts } from "../utils/rifaHelper";

// ==================================================================
// INICIO DE CAMBIOS: Importamos nuestras nuevas constantes
// ==================================================================
import { RIFAS_ESTADOS } from "../constants/rifas";
// ==================================================================
// FIN DE CAMBIOS
// ==================================================================


function RifasPublic() {
  const [rifas, setRifas] = useState([]);
  // ==================================================================
  // INICIO DE CAMBIOS: Nuevos estados para la paginación
  // ==================================================================
  const [cargando, setCargando] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const RIFAS_POR_PAGINA = 6; // Podemos ajustar este número
  // ==================================================================
  // FIN DE CAMBIOS
  // ==================================================================

  useEffect(() => {
    // ==================================================================
    // INICIO DE CAMBIOS: Función para la carga inicial de rifas
    // ==================================================================
    const fetchInitialRifas = async () => {
      setCargando(true);
      try {
        const q = query(
          collection(db, "rifas"), 
          where("estado", "!=", RIFAS_ESTADOS.PENDIENTE), 
          orderBy("estado"), 
          orderBy("fechaCreacion", "desc"),
          limit(RIFAS_POR_PAGINA) // ¡Limitamos la primera carga!
        );
        
        const documentSnapshots = await getDocs(q);

        const ultRifaVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];
        setLastVisible(ultRifaVisible);

        const rifasData = documentSnapshots.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setRifas(rifasData);

        if (documentSnapshots.docs.length < RIFAS_POR_PAGINA) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }

      } catch (error) {
        console.error("Error al cargar las rifas:", error);
        // Aquí podríamos mostrar un mensaje de error en la UI
      }
      setCargando(false);
    };
    
    fetchInitialRifas();
    // Ya no usamos onSnapshot para la carga inicial para poder controlar la paginación.
    // Podríamos añadir un listener para actualizaciones en tiempo real si fuera necesario, pero es más complejo.
    // ==================================================================
    // FIN DE CAMBIOS
    // ==================================================================
  }, []);

  // ==================================================================
  // INICIO DE CAMBIOS: Nueva función para cargar más rifas
  // ==================================================================
  const handleCargarMas = async () => {
    if (!lastVisible) return;

    setCargandoMas(true);
    try {
      const q = query(
        collection(db, "rifas"), 
        where("estado", "!=", RIFAS_ESTADOS.PENDIENTE), 
        orderBy("estado"), 
        orderBy("fechaCreacion", "desc"),
        startAfter(lastVisible), // Empezamos a buscar DESPUÉS de la última rifa que vimos
        limit(RIFAS_POR_PAGINA)
      );

      const documentSnapshots = await getDocs(q);

      const ultRifaVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];
      setLastVisible(ultRifaVisible);

      const nuevasRifas = documentSnapshots.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setRifas(prevRifas => [...prevRifas, ...nuevasRifas]);

      if (documentSnapshots.docs.length < RIFAS_POR_PAGINA) {
        setHasMore(false);
      }

    } catch (error) {
      console.error("Error al cargar más rifas:", error);
    }
    setCargandoMas(false);
  };
  // ==================================================================
  // FIN DE CAMBIOS
  // ==================================================================

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Rifas Disponibles</h2>
      
      {cargando ? (
        <p className="text-center">Cargando rifas...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rifas.map((rifa) => {
              const { vendidos, disponibles, porcentaje } = getTicketCounts(rifa);
              const conditionText = getDrawConditionText(rifa);

              return (
                <Link key={rifa.id} to={`/rifas/${rifa.id}`} className="bg-white rounded shadow p-4 hover:shadow-lg transition flex flex-col">
                  <img
                    src={rifa.imagenes?.[0] || "https://via.placeholder.com/400x300?text=Sin+imagen"}
                    alt={rifa.nombre}
                    className="w-full h-48 object-cover rounded mb-4"
                  />
                  <div className="flex-grow">
                    <h3 className="text-lg font-bold mb-1">{rifa.nombre}</h3>
                    <p className="text-sm text-gray-700 mb-1"><strong>Precio:</strong> ${rifa.precio}</p>
                    <div className="text-sm mb-1 flex items-center gap-2">
                      <strong>Estado:</strong>
                      <span className={`px-2 py-1 rounded text-white text-xs font-semibold capitalize ${rifa.estado === RIFAS_ESTADOS.ACTIVA ? "bg-green-500" : "bg-red-500"}`}>
                        {rifa.estado}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2 italic">{conditionText}</p>
                    <p className="text-sm mb-1"><strong>Vendidos:</strong> {vendidos}</p>
                    <p className="text-sm mb-1"><strong>Disponibles:</strong> {disponibles}</p>
                  </div>
                  <div className="mt-auto pt-2">
                    <div className="mt-2 bg-gray-200 h-3 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full" style={{ width: `${porcentaje}%` }}></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Progreso: {porcentaje.toFixed(1)}%</p>
                  </div>
                </Link>
              );
            })}
          </div>
          {/* ================================================================== */}
          {/* INICIO DE CAMBIOS: Botón para Cargar Más */}
          {/* ================================================================== */}
          {hasMore && (
            <div className="text-center mt-10">
              <button 
                onClick={handleCargarMas} 
                disabled={cargandoMas}
                className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors shadow-md disabled:bg-gray-400"
              >
                {cargandoMas ? 'Cargando...' : 'Cargar más rifas'}
              </button>
            </div>
          )}
          {/* ================================================================== */}
          {/* FIN DE CAMBIOS */}
          {/* ================================================================== */}
        </>
      )}
    </div>
  );
}

export default RifasPublic;