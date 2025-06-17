// src/pages/Home.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { RIFAS_ESTADOS } from '../constants/rifas';

// --- Sub-componente para la sección "Cómo participar" ---
const PasosSection = () => (
    <div className="bg-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
                <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Participar es Muy Fácil</h2>
                <p className="mt-4 text-lg text-gray-500">Sigue estos simples pasos y podrías ser nuestro próximo ganador.</p>
            </div>
            <div className="mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
                <div className="text-center">
                    <div className="flex items-center justify-center h-12 w-12 mx-auto bg-indigo-600 text-white rounded-full text-xl font-bold">1</div>
                    <h3 className="mt-5 text-lg font-medium text-gray-900">Elige tu Sorteo</h3>
                    <p className="mt-2 text-base text-gray-500">Explora nuestros sorteos activos y selecciona el premio que más te guste.</p>
                </div>
                <div className="text-center">
                    <div className="flex items-center justify-center h-12 w-12 mx-auto bg-indigo-600 text-white rounded-full text-xl font-bold">2</div>
                    <h3 className="mt-5 text-lg font-medium text-gray-900">Selecciona Boletos</h3>
                    <p className="mt-2 text-base text-gray-500">Usa el tablero interactivo para escoger tus números de la suerte.</p>
                </div>
                <div className="text-center">
                    <div className="flex items-center justify-center h-12 w-12 mx-auto bg-indigo-600 text-white rounded-full text-xl font-bold">3</div>
                    <h3 className="mt-5 text-lg font-medium text-gray-900">Aparta y Paga</h3>
                    <p className="mt-2 text-base text-gray-500">Contáctanos por WhatsApp para apartar tus boletos y recibir los datos de pago.</p>
                </div>
                <div className="text-center">
                    <div className="flex items-center justify-center h-12 w-12 mx-auto bg-indigo-600 text-white rounded-full text-xl font-bold">4</div>
                    <h3 className="mt-5 text-lg font-medium text-gray-900">¡Espera y Gana!</h3>
                    <p className="mt-2 text-base text-gray-500">Verifica tu boleto y espera el día del sorteo. ¡Mucha suerte!</p>
                </div>
            </div>
        </div>
    </div>
);

// --- Componente para la nueva sección Héroe ---
const RifaHero = ({ rifa }) => {
    const porcentajeVendido = rifa.boletos > 0 ? ((rifa.boletosVendidos || 0) / rifa.boletos) * 100 : 0;
    
    return (
        <div className="bg-slate-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
                    <div className="relative group rounded-xl overflow-hidden shadow-2xl">
                         <Link to={`/rifa/${rifa.id}`} className="block">
                            <div className="aspect-w-16 aspect-h-9">
                                <img 
                                    src={rifa.imagenes?.[0] || `https://placehold.co/800x450/1e293b/ffffff?text=Sorteo+Estelar`}
                                    alt={rifa.nombre}
                                    className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>
                         </Link>
                    </div>
                    <div className="mt-12 lg:mt-0">
                        <span className="text-indigo-400 font-semibold tracking-wide uppercase">Sorteo Principal</span>
                        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mt-2">{rifa.nombre}</h1>
                        <p className="mt-4 text-lg text-slate-300 line-clamp-3">{rifa.descripcion}</p>
                        <div className="mt-8">
                           <p className="text-slate-400 text-sm">Precio del boleto</p>
                           <p className="text-4xl font-bold text-indigo-500">${rifa.precio.toLocaleString('es-MX')}</p>
                        </div>
                        <div className="mt-6">
                           <div className="flex justify-between items-center mb-1">
                               <span className="text-sm font-semibold text-slate-300">Progreso</span>
                               <span className="text-sm font-bold text-indigo-400">{porcentajeVendido.toFixed(1)}%</span>
                           </div>
                           <div className="bg-slate-700 h-4 rounded-full overflow-hidden">
                               <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full" style={{ width: `${porcentajeVendido}%` }}></div>
                           </div>
                        </div>
                        <Link to={`/rifa/${rifa.id}`} className="mt-10 inline-block bg-indigo-600 text-white font-bold text-lg py-4 px-10 rounded-lg hover:bg-indigo-700 transition-all transform hover:scale-105 w-full sm:w-auto text-center shadow-lg">
                            ¡Participar ahora!
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Componente para las tarjetas de sorteos ---
const RifaCard = ({ rifa, isFinished = false, onShowResults }) => {
    const porcentajeVendido = rifa.boletos > 0 ? ((rifa.boletosVendidos || 0) / rifa.boletos) * 100 : 0;
    
    const ImageContainer = ({ children }) => {
        if (isFinished) {
            return <div className="aspect-w-16 aspect-h-9 w-full overflow-hidden">{children}</div>;
        }
        return <Link to={`/rifa/${rifa.id}`} className="block aspect-w-16 aspect-h-9 w-full overflow-hidden">{children}</Link>;
    };

    const ActionButton = () => {
        if (isFinished) {
            return (
                <button
                    onClick={() => onShowResults(rifa.id)}
                    className="w-full text-center block font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 text-white bg-gray-500 hover:bg-gray-600"
                >
                    Ver Resultados
                </button>
            );
        }
        return (
            <Link 
                to={`/rifa/${rifa.id}`} 
                className="w-full text-center block font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
                Participar
            </Link>
        );
    };

    return (
        <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group flex flex-col">
            <ImageContainer>
                <img
                    src={rifa.imagenes?.[0] || `https://placehold.co/600x400/e2e8f0/4a5568?text=Sin+Imagen`}
                    alt={rifa.nombre}
                    className={`w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105 ${isFinished ? 'filter grayscale' : ''}`}
                />
            </ImageContainer>
            <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-gray-900 truncate">{rifa.nombre}</h3>
                <p className="text-2xl font-extrabold text-indigo-600 my-2">${rifa.precio.toLocaleString('es-MX')}</p>
                <div className="w-full mt-2">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold text-gray-500 uppercase">Progreso</span>
                        <span className="text-sm font-bold text-indigo-600">{porcentajeVendido.toFixed(1)}%</span>
                    </div>
                    <div className="bg-gray-200 h-2.5 rounded-full overflow-hidden">
                        <div 
                           className={`h-full rounded-full ${isFinished ? 'bg-gray-400' : 'bg-gradient-to-r from-purple-500 to-indigo-500'}`} 
                           style={{ width: `${porcentajeVendido}%` }}>
                        </div>
                    </div>
                </div>
                <div className="mt-auto pt-6">
                    <ActionButton />
                </div>
            </div>
        </div>
    )
}

// --- NUEVO Componente para el Modal de Resultados ---
const ResultadosModal = ({ isOpen, onClose, data, isLoading }) => {
    if (!isOpen) return null;

    const formatDate = (timestamp) => {
        if (!timestamp) return 'No disponible';
        return new Date(timestamp.seconds * 1000).toLocaleDateString('es-MX', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 animate-fade-in-fast" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 text-center relative">
                    <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-2 rounded-full text-2xl leading-none">&times;</button>
                    {isLoading ? (
                        <div className="py-10">Cargando resultados...</div>
                    ) : data ? (
                        <>
                            <span className="text-sm font-bold text-indigo-500 uppercase">Resultados del Sorteo</span>
                            <h3 className="text-2xl font-bold text-gray-800 mt-2">{data.nombreRifa}</h3>
                            <p className="text-sm text-gray-500 mt-1">Sorteo realizado el: {formatDate(data.fechaRegistro)}</p>
                            
                            <div className="mt-8 bg-slate-100 rounded-lg py-6">
                               <p className="text-lg text-gray-600">Boleto Ganador:</p>
                               <p className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 tracking-wider">
                                   {String(data.numeroGanador).padStart(5, '0')}
                               </p>
                            </div>
                            <p className="text-xs text-gray-400 mt-6">¡Felicidades al afortunado ganador! Gracias a todos por participar.</p>
                        </>
                    ) : (
                        <p className="py-10">No se encontraron resultados para este sorteo.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

function Home() {
    const [rifaDestacada, setRifaDestacada] = useState(null);
    const [otrasRifas, setOtrasRifas] = useState([]);
    const [rifasFinalizadas, setRifasFinalizadas] = useState([]);
    const [cargando, setCargando] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [isLoadingModal, setIsLoadingModal] = useState(false);

    useEffect(() => {
        const fetchAllRifas = async () => {
            setCargando(true);
            try {
                const qActivas = query(collection(db, "rifas"), where("estado", "==", RIFAS_ESTADOS.ACTIVA), orderBy("fechaCreacion", "desc"), limit(10));
                const qFinalizadas = query(collection(db, "rifas"), where("estado", "==", RIFAS_ESTADOS.FINALIZADA), orderBy("fechaCreacion", "desc"), limit(3));
                
                const [activasSnapshot, finalizadasSnapshot] = await Promise.all([getDocs(qActivas), getDocs(qFinalizadas)]);
                
                const rifasActivasData = activasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                if (rifasActivasData.length > 0) {
                    setRifaDestacada(rifasActivasData[0]);
                    setOtrasRifas(rifasActivasData.slice(1));
                }
                
                const rifasFinalizadasData = finalizadasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setRifasFinalizadas(rifasFinalizadasData);

            } catch (error) {
                console.error("Error al cargar los sorteos: ", error); // Texto actualizado
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
        <div className="bg-slate-100">
            <ResultadosModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                data={modalData}
                isLoading={isLoadingModal}
            />
            {cargando ? (
                <div className="text-center py-40">Cargando...</div>
            ) : rifaDestacada ? (
                <>
                    <RifaHero rifa={rifaDestacada} />
                    {(otrasRifas.length > 0) && (
                        <div className="py-16 sm:py-24">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">Más Oportunidades Para Ganar</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {otrasRifas.map(rifa => <RifaCard key={rifa.id} rifa={rifa} onShowResults={handleVerResultados} />)}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="bg-white text-center py-40">
                    <h2 className="text-3xl font-bold text-gray-700">No hay sorteos disponibles</h2>
                    <p className="text-gray-500 mt-2">¡Vuelve pronto para más oportunidades de ganar!</p>
                </div>
            )}
            
            {rifasFinalizadas.length > 0 && (
                 <div className="bg-white pt-16 sm:pt-24 pb-4">
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">Sorteos Finalizados</h2>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
