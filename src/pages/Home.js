// src/pages/Home.js 

import React, { useState, useEffect } from 'react'; 
import { Link } from 'react-router-dom'; 
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'; 
import { db } from '../firebase/firebaseConfig'; 
import { RIFAS_ESTADOS } from '../constants/rifas';
// Se importa la función de utilidad que ya validamos
import { getDrawConditionText } from '../utils/rifaHelper';

// =================================================================================================
// INICIO DE LA MODIFICACIÓN: RifaCard corregida para alinear y reparar el botón
// =================================================================================================
const RifaCard = ({ rifa, isFinished = false, onShowResults }) => {
    if (!rifa) return null;

    const porcentajeVendido = rifa.boletos > 0 ? ((rifa.boletosVendidos || 0) / rifa.boletos) * 100 : 0;
    const conditionText = getDrawConditionText(rifa, 'resumido');

    // El contenido visual de la tarjeta, para reutilizarlo
    const CardContent = () => (
        <>
            {!isFinished && (
                 <div className="p-2 text-center bg-red-50 border-b border-red-200">
                    <p className="text-xs font-semibold text-red-700">{conditionText}</p>
                </div>
            )}
            
            <div className="aspect-w-16 aspect-h-9">
                <img
                    src={rifa.imagenes?.[0] || `https://placehold.co/600x400/e2e8f0/475569?text=Sorteo`}
                    alt={rifa.nombre}
                    className={`w-full h-full object-cover ${isFinished ? 'filter grayscale' : ''}`}
                />
            </div>

            <div className="p-3 flex flex-col flex-grow">
                <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2 flex-grow">
                    {rifa.nombre}
                </h3>
                
                <div className="my-2">
                    <p className="text-2xl font-bold text-green-600">
                        ${rifa.precio.toLocaleString('es-MX')}
                    </p>
                    <p className="text-xs text-gray-600 font-medium">precio por boleto</p>
                </div>

                <div className="w-full my-1">
                    <div className="bg-gray-200 h-2 rounded-full">
                        <div 
                           className={`h-full rounded-full ${isFinished ? 'bg-gray-400' : 'bg-green-500'}`} 
                           style={{ width: `${porcentajeVendido}%` }}>
                        </div>
                    </div>
                     <p className="text-xs text-gray-600 mt-1 text-center font-medium">
                        {porcentajeVendido.toFixed(1)}% de boletos vendidos
                    </p>
                </div>
            </div>
        </>
    );
    
    return (
        <div className="bg-white rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col h-full border border-gray-200">
            {isFinished ? (
                // Para sorteos finalizados, el contenido no es un enlace
                <div className="flex flex-col h-full">
                    <CardContent />
                    <div className="p-3 pt-0 mt-auto">
                        <button 
                            onClick={() => onShowResults(rifa.id)}
                            className="w-full text-center font-bold py-2.5 px-4 rounded-md transition-colors text-xs uppercase text-white bg-gray-600 hover:bg-gray-700"
                        >
                            Ver Resultados
                        </button>
                    </div>
                </div>
            ) : (
                // Para sorteos activos, toda la tarjeta es un enlace
                <Link to={`/rifa/${rifa.id}`} className="block h-full flex flex-col">
                    <CardContent />
                    <div className="p-3 pt-0 mt-auto">
                        <div className="w-full text-center font-bold py-2.5 px-4 rounded-md text-xs uppercase text-white bg-red-600">
                            Comprar Boletos
                        </div>
                    </div>
                </Link>
            )}
        </div>
    );
}
// =================================================================================================
// FIN DE LA MODIFICACIÓN
// =================================================================================================


// --- Componente para la sección Héroe (Banner) --- 
const HeroSection = () => ( 
    <div className="relative bg-gray-800 py-20 sm:py-32 flex items-center justify-center text-center px-4">
        <img
            src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop"
            alt="Fondo de colores"
            className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative z-10">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight">
                EL MEJOR SITIO DE SORTEOS
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg sm:text-xl text-gray-200">
                ¡Participa y Gana! Explora nuestros sorteos y encuentra tu oportunidad para ganar premios increíbles. Comprar tu boleto es fácil, seguro y rápido.
            </p>
        </div>
    </div>
);

// --- Sub-componente "Cómo participar" (Restaurado desde tu archivo original) --- 
const PasosSection = () => ( 
    <div className="bg-white py-16 sm:py-24"> 
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> 
            <div className="text-center">
                <h2 className="text-3xl font-extrabold sm:text-4xl text-gray-900">Participar es Muy Fácil</h2> 
                <p className="mt-4 text-lg text-gray-600">Sigue estos simples pasos y podrías ser nuestro próximo ganador.</p> 
            </div> 
            <div className="mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-4"> 
                <div className="text-center"> 
                    <div className="flex items-center justify-center h-12 w-12 mx-auto bg-red-600 text-white rounded-full text-xl font-bold">1</div> 
                    <h3 className="mt-5 text-lg font-medium text-gray-900">Elige tu Sorteo</h3> 
                    <p className="mt-2 text-base text-gray-500">Explora nuestros sorteos activos y selecciona el premio que más te guste.</p> 
                </div> 
                <div className="text-center"> 
                    <div className="flex items-center justify-center h-12 w-12 mx-auto bg-red-600 text-white rounded-full text-xl font-bold">2</div> 
                    <h3 className="mt-5 text-lg font-medium text-gray-900">Selecciona Boletos</h3> 
                    <p className="mt-2 text-base text-gray-500">Usa el tablero interactivo para escoger tus números de la suerte.</p> 
                </div> 
                <div className="text-center"> 
                    <div className="flex items-center justify-center h-12 w-12 mx-auto bg-red-600 text-white rounded-full text-xl font-bold">3</div> 
                    <h3 className="mt-5 text-lg font-medium text-gray-900">Aparta y Paga</h3> 
                    <p className="mt-2 text-base text-gray-500">Contáctanos por WhatsApp para apartar tus boletos y recibir los datos de pago.</p> 
                </div> 
                <div className="text-center"> 
                    <div className="flex items-center justify-center h-12 w-12 mx-auto bg-red-600 text-white rounded-full text-xl font-bold">4</div> 
                    <h3 className="mt-5 text-lg font-medium text-gray-900">¡Espera y Gana!</h3> 
                    <p className="mt-2 text-base text-gray-500">Verifica tu boleto y espera el día del sorteo. ¡Mucha suerte!</p> 
                </div> 
            </div> 
        </div> 
    </div> 
); 

// --- Componente para el Modal de Resultados (sin cambios) --- 
const ResultadosModal = ({ isOpen, onClose, data, isLoading }) => { 
    if (!isOpen) return null; 
    const formatDate = (timestamp) => { 
        if (!timestamp) return 'No disponible'; 
        return new Date(timestamp.seconds * 1000).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }); 
    } 
    return ( 
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 animate-fade-in-fast" onClick={onClose}> 
            <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}> 
                <div className="p-6 text-center relative"> 
                    <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-2 rounded-full text-2xl leading-none">&times;</button> 
                    {isLoading ? ( 
                        <div className="py-10 text-gray-700">Cargando resultados...</div> 
                    ) : data ? ( 
                        <> 
                            <span className="text-sm font-bold text-gray-500 uppercase">Resultados del Sorteo</span> 
                            <h3 className="text-2xl font-bold mt-2 text-gray-900">{data.nombreRifa}</h3> 
                            <p className="text-sm text-gray-500 mt-1">Sorteo realizado el: {formatDate(data.fechaRegistro)}</p> 
                            <div className="mt-8 bg-gray-100 rounded-lg py-6"> 
                                <p className="text-lg text-gray-600">Boleto Ganador:</p> 
                                <p className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 tracking-wider"> 
                                    {String(data.numeroGanador).padStart(5, '0')} 
                                </p> 
                            </div> 
                            <p className="text-xs text-gray-500 mt-6">¡Felicidades al afortunado ganador! Gracias a todos por participar.</p> 
                        </> 
                    ) : ( 
                        <p className="py-10 text-gray-700">No se encontraron resultados para este sorteo.</p> 
                    )} 
                </div> 
            </div> 
        </div> 
    ); 
}; 

function Home() { 
    // Lógica para obtener los datos de la DB (eliminando la sección de "Sorteo Principal")
    const [rifasActivas, setRifasActivas] = useState([]); 
    const [rifasFinalizadas, setRifasFinalizadas] = useState([]); 
    const [cargando, setCargando] = useState(true); 

    const [isModalOpen, setIsModalOpen] = useState(false); 
    const [modalData, setModalData] = useState(null); 
    const [isLoadingModal, setIsLoadingModal] = useState(false); 

    useEffect(() => { 
        const fetchAllRifas = async () => { 
            setCargando(true); 
            try { 
                const qActivas = query(collection(db, "rifas"), where("estado", "==", RIFAS_ESTADOS.ACTIVA), orderBy("fechaCreacion", "desc")); 
                const qFinalizadas = query(collection(db, "rifas"), where("estado", "==", RIFAS_ESTADOS.FINALIZADA), orderBy("fechaCreacion", "desc"), limit(4)); 
                
                const [activasSnapshot, finalizadasSnapshot] = await Promise.all([getDocs(qActivas), getDocs(qFinalizadas)]); 
                
                const rifasActivasData = activasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); 
                setRifasActivas(rifasActivasData);
                
                const rifasFinalizadasData = finalizadasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); 
                setRifasFinalizadas(rifasFinalizadasData); 

            } catch (error) { 
                console.error("Error al cargar los sorteos: ", error); 
            } finally { 
                setCargando(false); 
            } 
        }; 
        fetchAllRifas(); 
    }, []); 

    const handleVerResultados = async (rifaId) => { 
        setIsLoadingModal(true); 
        setIsModalOpen(true); 
        setModalData(null); 
        try { 
            const q = query(collection(db, 'ganadores'), where('rifaId', '==', rifaId), limit(1)); 
            const querySnapshot = await getDocs(q); 
            if (!querySnapshot.empty) { 
                setModalData(querySnapshot.docs[0].data()); 
            } else { 
                setModalData(null); 
            } 
        } catch (error) { 
            console.error("Error al buscar resultados:", error); 
            setModalData(null); 
        } finally { 
            setIsLoadingModal(false); 
        } 
    }; 

    return ( 
        <div className="bg-gray-50"> 
            <ResultadosModal  
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                data={modalData} 
                isLoading={isLoadingModal} 
            /> 
            
            <HeroSection />

            <main id="sorteos-activos" className="py-16 sm:py-20">
                {cargando ? (
                    <div className="text-center py-20 text-gray-700">Cargando...</div>
                ) : rifasActivas.length > 0 ? (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-extrabold text-center mb-12 text-gray-900">Oportunidades Disponibles</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {rifasActivas.map(rifa => <RifaCard key={rifa.id} rifa={rifa} onShowResults={handleVerResultados} />)}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <h2 className="text-3xl font-bold text-gray-900">No hay sorteos disponibles</h2>
                        <p className="text-gray-600 mt-2">¡Vuelve pronto para más oportunidades de ganar!</p>
                    </div>
                )}
            </main>
            
            {rifasFinalizadas.length > 0 && ( 
                <div className="bg-white pt-16 sm:pt-20 pb-16 border-t border-gray-200"> 
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> 
                        <h2 className="text-3xl font-extrabold text-center mb-12 text-gray-900">Sorteos Finalizados</h2> 
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"> 
                            {rifasFinalizadas.map(rifa => <RifaCard key={rifa.id} rifa={rifa} isFinished={true} onShowResults={handleVerResultados} />)} 
                        </div> 
                    </div> 
                </div> 
            )} 
            
            <PasosSection /> 
        </div> 
    ); 
} 

export default Home;
