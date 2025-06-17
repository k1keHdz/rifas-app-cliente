// src/pages/admin/GestionarRifasPage.js

import React from 'react';
import { useRifas } from '../../context/RifasContext';
import RifaForm from '../../components/RifaForm';
import RifasList from '../../components/RifasList';
import Alerta from '../../components/Alerta';
// --- ÚNICOS CAMBIOS EN LOS IMPORTS ---
// Se importa solo lo necesario para la nueva función de borrado
// y se eliminan los que ya no se usan (storage, getDocs, etc.)
import { db } from '../../firebase/firebaseConfig';
import { doc, deleteDoc } from "firebase/firestore";

// --- ÍCONOS ORIGINALES, SIN CAMBIOS ---
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const ListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>;

function GestionarRifasPage() {
  // --- LÓGICA DE LA INTERFAZ ORIGINAL, SIN CAMBIOS ---
  const { isFormVisible, iniciarCreacionRifa, ocultarFormulario, feedback } = useRifas();
  const [activeTab, setActiveTab] = React.useState('lista');

  React.useEffect(() => {
    if (isFormVisible) {
      setActiveTab('editor');
    } else {
      setActiveTab('lista');
    }
  }, [isFormVisible]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'lista' && isFormVisible) {
      ocultarFormulario();
    }
  }

  // --- ¡AQUÍ ESTÁ LA FUNCIÓN ACTUALIZADA! ---
  // Se reemplaza la función de borrado manual por la nueva versión simplificada
  // que activa la Cloud Function.
  const handleDeleteRifa = async (rifaId, nombreRifa) => {
    if (!window.confirm(`¿Estás SEGURO de eliminar la rifa "${nombreRifa}"? Esta acción es PERMANENTE y borrará la rifa y todos sus datos asociados.`)) {
      return;
    }
    try {
      // 1. Se apunta directamente al documento de la rifa que se quiere borrar.
      const rifaRef = doc(db, "rifas", rifaId);
      // 2. Se borra únicamente ese documento.
      await deleteDoc(rifaRef);
      // 3. El "robot" (Cloud Function) se activará automáticamente en la nube
      //    para limpiar las ventas, las imágenes y los ganadores.
      alert(`La rifa "${nombreRifa}" ha sido eliminada. La limpieza de todos los datos se completará en segundo plano.`);
    } catch (error) {
      console.error("Error al iniciar la eliminación de la rifa:", error);
      alert("Ocurrió un error al intentar eliminar la rifa.");
    }
  };

  // --- TODA LA ESTRUCTURA JSX ORIGINAL SE RESPETA AL 100% ---
  return (
    <div className="p-4 max-w-7xl mx-auto relative min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Rifas</h1>
      </div>
      {feedback.msg && <Alerta mensaje={feedback.msg} tipo={feedback.type} />}
      <div className="border-b border-gray-200 mb-6 mt-4">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <button onClick={() => handleTabChange('lista')} className={`flex items-center whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-colors ${ activeTab === 'lista' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300' }`}><ListIcon /> Listado de Rifas</button>
          {isFormVisible && (
            <button onClick={() => handleTabChange('editor')} className={`flex items-center whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-colors ${ activeTab === 'editor' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300' }`}><EditIcon /> Editor de Rifa</button>
          )}
        </nav>
      </div>
      
      {activeTab === 'lista' && <RifasList onDeleteRifa={handleDeleteRifa} />}
      {activeTab === 'editor' && isFormVisible && <RifaForm />}

      {activeTab === 'lista' && !isFormVisible && (
        <button 
          onClick={iniciarCreacionRifa} 
          title="Crear Nueva Rifa"
          className="fixed bottom-8 right-8 bg-green-600 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:bg-green-700 transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <span className="text-4xl font-thin pb-1">+</span>
        </button>
      )}
    </div>
  );
};

export default GestionarRifasPage;
