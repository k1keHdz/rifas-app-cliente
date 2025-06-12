// src/components/RifasList.js

import { deleteDoc, doc, getDocs, collection } from "firebase/firestore";
import { ref, deleteObject, listAll } from "firebase/storage";
import { db, storage } from "../firebase/firebaseConfig";
import { useRifas } from "../context/RifasContext";
import { getDrawConditionText, getTicketCounts } from "../utils/rifaHelper";

function RifasList() {
  const { rifas, cargando, seleccionarRifaParaEditar } = useRifas();

  const handleEliminar = async (id) => {
    // CAMBIO: Añadimos una confirmación más segura
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta rifa? Esta acción es irreversible y borrará todas sus ventas e imágenes.")) {
      return;
    }

    try {
      // Borrar subcolección de ventas
      const ventasRef = collection(db, "rifas", id, "ventas");
      const ventasSnap = await getDocs(ventasRef);
      await Promise.all(ventasSnap.docs.map((docVenta) => deleteDoc(docVenta.ref)));
      
      // Borrar carpeta de imágenes en Storage
      const carpetaRef = ref(storage, `imagenes/${id}`);
      const listado = await listAll(carpetaRef);
      await Promise.all(listado.items.map((imgRef) => deleteObject(imgRef)));
      
      // Finalmente, borrar el documento de la rifa
      await deleteDoc(doc(db, "rifas", id));
      
      // Opcional: mostrar una alerta de éxito
      alert("Rifa eliminada con éxito.");

    } catch (error) {
      console.error("Error al eliminar la rifa:", error);
      alert("Hubo un error al eliminar la rifa.");
    }
  };

  if (cargando) return <p className="text-center mt-8">Cargando rifas...</p>;
  
  if (rifas.length === 0) {
    return <p className="text-center mt-8 text-gray-500">No hay rifas creadas todavía. ¡Crea una para empezar!</p>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {rifas.map((rifa) => {
        const { vendidos } = getTicketCounts(rifa); // Solo necesitamos 'vendidos' aquí
        const porcentaje = rifa.boletos > 0 ? (vendidos / rifa.boletos) * 100 : 0;
        const conditionText = getDrawConditionText(rifa);

        return (
          <div key={rifa.id} className="border rounded-lg shadow-md bg-white flex flex-col transition-shadow hover:shadow-xl">
            <img
              src={rifa.imagenes?.[0] || "https://via.placeholder.com/400x300?text=Sin+imagen"}
              alt={rifa.nombre}
              className="w-full h-48 object-cover rounded-t-lg"
            />
            <div className="p-4 flex-grow flex flex-col">
              <h3 className="text-xl font-bold mb-2 text-gray-800">{rifa.nombre}</h3>
              <p className="text-sm text-gray-600 mb-3 h-10 overflow-hidden">{rifa.descripcion}</p>
              
              <div className="text-sm space-y-1 mb-3">
                <p><strong>Precio:</strong> ${rifa.precio}</p>
                <p><strong>Estado:</strong> <span className={`font-semibold ${rifa.estado === 'activa' ? 'text-green-600' : 'text-yellow-600'}`}>{rifa.estado}</span></p>
                <p className="text-gray-500 italic">{conditionText}</p>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2.5 my-2">
                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${porcentaje}%` }}></div>
              </div>
              <p className="text-xs text-gray-600 text-right mb-4">{porcentaje.toFixed(1)}% vendido ({vendidos} de {rifa.boletos})</p>
              
              {/* CAMBIO: Se eliminó el Link a "Ver Historial" y se ajustó el layout de los botones */}
              <div className="mt-auto pt-4 border-t flex gap-2">
                <button 
                  onClick={() => seleccionarRifaParaEditar(rifa)} 
                  className="w-1/2 bg-blue-600 text-white py-2 rounded-md text-center hover:bg-blue-700 transition-colors font-semibold"
                >
                  Editar
                </button>
                <button 
                  onClick={() => handleEliminar(rifa.id)}
                  className="w-1/2 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-colors font-semibold"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default RifasList;