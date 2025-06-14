// src/pages/admin/GestionarRifasPage.js

import React from 'react';
import { useRifas } from '../../context/RifasContext';
import RifaForm from '../../components/RifaForm';
import RifasList from '../../components/RifasList';
import Alerta from '../../components/Alerta';
import { db, storage } from '../../firebase/firebaseConfig';
import { doc, deleteDoc, collection, getDocs, writeBatch } from "firebase/firestore";
import { ref, listAll, deleteObject } from "firebase/storage";

const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const ListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;

function GestionarRifasPage() {
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

  const handleDeleteRifa = async (rifaId, nombreRifa) => {
    if (!window.confirm(`¿Estás SEGURO de eliminar la rifa "${nombreRifa}"? Esta acción es PERMANENTE y borrará la rifa, todas sus ventas y todas sus imágenes.`)) {
      return;
    }
    try {
      console.log(`Iniciando eliminación completa de la rifa: ${rifaId}`);
      // 1. Borrar imágenes de Firebase Storage
      const carpetaRef = ref(storage, `imagenes/${rifaId}`);
      const listado = await listAll(carpetaRef);
      console.log(`Encontradas ${listado.items.length} imágenes en Storage para borrar.`);
      if (listado.items.length > 0) {
        await Promise.all(listado.items.map(imgRef => deleteObject(imgRef)));
        console.log("Imágenes borradas de Storage con éxito.");
      }

      // 2. Borrar subcolección de ventas
      const ventasRef = collection(db, "rifas", rifaId, "ventas");
      const ventasSnapshot = await getDocs(ventasRef);
      if (ventasSnapshot.docs.length > 0) {
        const batch = writeBatch(db);
        ventasSnapshot.docs.forEach(ventaDoc => {
          batch.delete(ventaDoc.ref);
        });
        await batch.commit();
        console.log(`${ventasSnapshot.docs.length} ventas eliminadas de Firestore.`);
      }
      
      // 3. Borrar el documento principal de la rifa
      const rifaRef = doc(db, "rifas", rifaId);
      await deleteDoc(rifaRef);
      console.log("Documento principal de la rifa eliminado.");

      alert(`La rifa "${nombreRifa}" ha sido eliminada con éxito.`);
    } catch (error) {
      console.error("Error al eliminar la rifa por completo:", error);
      alert("Ocurrió un error al intentar eliminar la rifa.");
    }
  };

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