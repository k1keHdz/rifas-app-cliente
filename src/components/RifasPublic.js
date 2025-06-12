// src/components/RifasPublic.js

import { useEffect, useState } from "react";
import { collection, query, where, orderBy, limit, startAfter, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";
import { getDrawConditionText, getTicketCounts } from "../utils/rifaHelper";
import { RIFAS_ESTADOS } from "../constants/rifas";

function RifasPublic() {
  const [rifas, setRifas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const RIFAS_POR_PAGINA = 9; // Aumentado a 9 para que se vea bien en la cuadrícula

  useEffect(() => {
    const fetchInitialRifas = async () => {
      setCargando(true);
      try {
        const q = query(
          collection(db, "rifas"), 
          where("estado", "==", RIFAS_ESTADOS.ACTIVA), // Mostramos solo las rifas activas
          orderBy("fechaCreacion", "desc"),
          limit(RIFAS_POR_PAGINA)
        );
        
        const documentSnapshots = await getDocs(q);
        const ultRifaVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];
        setLastVisible(ultRifaVisible);
        const rifasData = documentSnapshots.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setRifas(rifasData);
        setHasMore(documentSnapshots.docs.length === RIFAS_POR_PAGINA);
      } catch (error) {
        console.error("Error al cargar las rifas:", error);
      }
      setCargando(false);
    };
    
    fetchInitialRifas();
  }, []);

  const handleCargarMas = async () => {
    if (!lastVisible) return;
    setCargandoMas(true);
    try {
      const q = query(
        collection(db, "rifas"), 
        where("estado", "==", RIFAS_ESTADOS.ACTIVA),
        orderBy("fechaCreacion", "desc"),
        startAfter(lastVisible),
        limit(RIFAS_POR_PAGINA)
      );
      const documentSnapshots = await getDocs(q);
      const ultRifaVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];
      setLastVisible(ultRifaVisible);
      const nuevasRifas = documentSnapshots.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setRifas(prevRifas => [...prevRifas, ...nuevasRifas]);
      setHasMore(documentSnapshots.docs.length === RIFAS_POR_PAGINA);
    } catch (error) {
      console.error("Error al cargar más rifas:", error);
    }
    setCargandoMas(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="p-4 sm:p-8 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Participa en Nuestras Rifas</h2>
        
        {cargando ? (
          <p className="text-center">Cargando rifas...</p>
        ) : rifas.length === 0 ? (
          <p className="text-center text-gray-600 py-10">No hay rifas activas en este momento. ¡Vuelve pronto!</p>
        ) : (
          <>
            {/* ================================================================== */}
            {/* INICIO DE CAMBIOS: Nuevo diseño de lista mobile-first */}
            {/* ================================================================== */}
            <div className="space-y-4">
              {rifas.map((rifa) => {
                const { porcentaje } = getTicketCounts(rifa);
                const conditionText = getDrawConditionText(rifa);

                return (
                  <div key={rifa.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow flex flex-col sm:flex-row overflow-hidden">
                    <div className="w-full sm:w-1/3 md:w-1/4">
                      <img
                        src={rifa.imagenes?.[0] || "https://via.placeholder.com/400x300?text=Sin+imagen"}
                        alt={rifa.nombre}
                        className="w-full h-48 sm:h-full object-cover"
                      />
                    </div>
                    <div className="p-5 flex flex-col flex-1 justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{rifa.nombre}</h3>
                        <p className="text-2xl font-bold text-blue-600 mb-3">${rifa.precio.toLocaleString('es-MX')} <span className="text-sm font-normal text-gray-500">por boleto</span></p>
                        <p className="text-xs text-gray-500 mb-4 italic">{conditionText}</p>
                      </div>
                      <div className="w-full">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-semibold text-gray-700">Progreso</span>
                          <span className="text-sm font-bold text-blue-600">{porcentaje.toFixed(1)}%</span>
                        </div>
                        <div className="bg-gray-200 h-3 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full rounded-full" style={{ width: `${porcentaje}%` }}></div>
                        </div>
                      </div>
                      <Link to={`/rifas/${rifa.id}`} className="mt-4 bg-gray-800 text-white font-bold py-2 px-4 rounded-lg hover:bg-black transition-colors text-center w-full sm:w-auto sm:self-end">
                        Ver Detalles y Comprar
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* ================================================================== */}
            {/* FIN DE CAMBIOS */}
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
          </>
        )}
      </div>
    </div>
  );
}

export default RifasPublic;