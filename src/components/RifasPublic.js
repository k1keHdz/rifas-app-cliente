import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { Link } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";
import { getDrawConditionText, getTicketCounts } from "../utils/rifaHelper";

function RifasPublic() {
  const [rifas, setRifas] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "rifas"), where("estado", "!=", "pendiente"), orderBy("estado"), orderBy("fechaCreacion", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRifas(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Rifas Disponibles</h2>
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
                  <span className={`px-2 py-1 rounded text-white text-xs font-semibold capitalize ${rifa.estado === "activa" ? "bg-green-500" : "bg-red-500"}`}>
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
    </div>
  );
}

export default RifasPublic;