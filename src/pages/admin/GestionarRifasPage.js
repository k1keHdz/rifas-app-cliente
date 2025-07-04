// src/pages/admin/GestionarRifasPage.js

import React from 'react';
// CORREGIDO: Rutas actualizadas
import { useRifas } from '../../context/RifasContext';
import RifaForm from '../../components/admin/RifaForm';
import RifasList from '../../components/rifas/RifasList';
import Alerta from '../../components/ui/Alerta';
import { db } from '../../config/firebaseConfig';
import { doc, deleteDoc } from "firebase/firestore";

// --- Iconos ---
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const ListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>;

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
        if (!window.confirm(`¿Estás SEGURO de eliminar el sorteo "${nombreRifa}"? Esta acción es PERMANENTE y borrará el sorteo y todos sus datos asociados.`)) {
            return;
        }
        try {
            const rifaRef = doc(db, "rifas", rifaId);
            await deleteDoc(rifaRef);
            alert(`El sorteo "${nombreRifa}" ha sido eliminado. La limpieza de todos los datos se completará en segundo plano.`);
        } catch (error) {
            console.error("Error al iniciar la eliminación del sorteo:", error);
            alert("Ocurrió un error al intentar eliminar el sorteo.");
        }
    };

    return (
        <div className="bg-background-dark p-4 max-w-7xl mx-auto relative min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Gestión de Sorteos</h1>
            </div>
            {feedback.msg && <Alerta mensaje={feedback.msg} tipo={feedback.type} />}
            <div className="border-b border-border-color mb-6 mt-4">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button onClick={() => handleTabChange('lista')} className={`flex items-center whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-colors ${ activeTab === 'lista' ? 'border-accent-primary text-accent-primary' : 'border-transparent text-text-subtle hover:border-border-color' }`}><ListIcon /> Listado de Sorteos</button>
                    {isFormVisible && (
                        <button onClick={() => handleTabChange('editor')} className={`flex items-center whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-colors ${ activeTab === 'editor' ? 'border-accent-primary text-accent-primary' : 'border-transparent text-text-subtle hover:border-border-color' }`}><EditIcon /> Editor de Sorteo</button>
                    )}
                </nav>
            </div>
            
            {activeTab === 'lista' && <RifasList onDeleteRifa={handleDeleteRifa} />}
            {activeTab === 'editor' && isFormVisible && <RifaForm />}

            {activeTab === 'lista' && !isFormVisible && (
                <button 
                    onClick={iniciarCreacionRifa} 
                    title="Crear Nuevo Sorteo"
                    className="fixed bottom-8 right-8 bg-gradient-to-r from-accent-start to-accent-end text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:opacity-90 transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-dark focus:ring-accent-end"
                >
                    <span className="text-4xl font-thin pb-1">+</span>
                </button>
            )}
        </div>
    );
};

export default GestionarRifasPage;
