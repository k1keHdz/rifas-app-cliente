// src/pages/Home.js 

import React, { useState, useEffect } from 'react'; 
import { Link } from 'react-router-dom'; 
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig'; 
import { RIFAS_ESTADOS } from '../constants/rifas';
import { getDrawConditionText, formatTicketNumber } from '../utils/rifaHelper';
import { FaTicketAlt, FaMousePointer, FaWhatsapp, FaTrophy } from 'react-icons/fa';

// --- Componentes de Diseño Adaptable (Sin cambios) ---
const RifaCard = ({ rifa, isFinished = false, onShowResults }) => {
    if (!rifa) return null;
    const porcentajeVendido = rifa.boletos > 0 ? ((rifa.boletosVendidos || 0) / rifa.boletos) * 100 : 0;
    const conditionText = getDrawConditionText(rifa, 'resumido');
    const CardContent = () => (
        <div className="relative group overflow-hidden rounded-xl h-full flex flex-col card">
            <img src={rifa.imagenes?.[0] || `https://placehold.co/600x400/171717/ffffff?text=Sorteo`} alt={rifa.nombre} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"/>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            <div className="relative p-5 flex flex-col h-full text-white">
                {!isFinished && (
                    <div className="absolute top-0 left-0 bg-gradient-to-r from-accent-primary to-accent-secondary text-text-on-accent text-xs font-bold px-3 py-1 rounded-br-lg shadow-md">
                        {conditionText}
                    </div>
                )}
                <div className="mt-auto">
                    <h3 className="font-extrabold text-2xl leading-tight tracking-tight line-clamp-2">
                        {rifa.nombre}
                    </h3>
                    <div className="my-4">
                        <p className="text-4xl font-bold text-accent-primary">
                            ${rifa.precio.toLocaleString('es-MX')}
                        </p>
                    </div>
                    <div className="w-full my-3">
                        <div className="bg-white/20 h-2.5 rounded-full">
                            <div className="bg-gradient-to-r from-accent-primary to-accent-secondary h-2.5 rounded-full" style={{ width: `${porcentajeVendido}%` }}></div>
                        </div>
                        <p className="text-xs text-white/70 mt-2 text-right font-semibold">
                            {porcentajeVendido.toFixed(0)}% VENDIDO
                        </p>
                    </div>
                    <div className="mt-6">
                         {isFinished ? (
                            <button onClick={() => onShowResults(rifa)} className="w-full text-center font-bold py-3 px-5 rounded-lg transition-all text-sm uppercase btn-secondary">
                                Ver Resultados
                            </button>
                        ) : (
                            <div className="w-full text-center font-bold py-3 px-5 rounded-lg transition-all text-sm uppercase btn btn-primary transform hover:scale-105">
                                Elegir Boletos
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
    return (
        <div className="h-full">
            {isFinished ? ( <CardContent /> ) : ( <Link to={`/rifa/${rifa.id}`} className="block h-full"><CardContent /></Link> )}
        </div>
    );
};
const HeroSection = () => (
    <div className="bg-background-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-accent-primary to-accent-secondary">
                La Suerte Te Espera
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-lg text-text-subtle">
                Sorteos exclusivos. Premios increíbles. Una oportunidad única para cambiar tu vida. Explora, elige tus números y prepárate para ganar.
            </p>
            <div className="mt-10">
                <a href="#sorteos-activos" className="btn btn-primary text-lg py-4 px-8">
                    Ver Sorteos Disponibles
                </a>
            </div>
        </div>
    </div>
);
const PasosSection = () => (
    <div className="bg-background-light py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
                <h2 className="text-base font-semibold text-accent-primary tracking-wider uppercase">Cómo Funciona</h2>
                <p className="mt-2 text-3xl font-extrabold text-text-headings sm:text-4xl">
                    Gana en 4 Simples Pasos
                </p>
            </div>
            <div className="mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
                <div className="text-center">
                    <div className="flex items-center justify-center h-16 w-16 mx-auto bg-background-dark border-2 border-accent-primary/50 text-accent-primary rounded-2xl"><FaTicketAlt size={30} /></div>
                    <h3 className="mt-6 text-xl font-bold text-text-headings">1. Elige tu Sorteo</h3>
                    <p className="mt-2 text-base text-text-subtle">Explora los premios y encuentra el que más te apasione.</p>
                </div>
                <div className="text-center">
                    <div className="flex items-center justify-center h-16 w-16 mx-auto bg-background-dark border-2 border-accent-primary/50 text-accent-primary rounded-2xl"><FaMousePointer size={30} /></div>
                    <h3 className="mt-6 text-xl font-bold text-text-headings">2. Selecciona Boletos</h3>
                    <p className="mt-2 text-base text-text-subtle">Usa nuestro selector interactivo para escoger tus números.</p>
                </div>
                <div className="text-center">
                    <div className="flex items-center justify-center h-16 w-16 mx-auto bg-background-dark border-2 border-accent-primary/50 text-accent-primary rounded-2xl"><FaWhatsapp size={30} /></div>
                    <h3 className="mt-6 text-xl font-bold text-text-headings">3. Aparta y Paga</h3>
                    <p className="mt-2 text-base text-text-subtle">Contáctanos por WhatsApp para asegurar tus boletos.</p>
                </div>
                <div className="text-center">
                    <div className="flex items-center justify-center h-16 w-16 mx-auto bg-background-dark border-2 border-accent-primary/50 text-accent-primary rounded-2xl"><FaTrophy size={30} /></div>
                    <h3 className="mt-6 text-xl font-bold text-text-headings">4. ¡Espera y Gana!</h3>
                    <p className="mt-2 text-base text-text-subtle">Verifica tu boleto en la fecha del sorteo. ¡Mucha suerte!</p>
                </div>
            </div>
        </div>
    </div>
);
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
                    ) : data && data.winner ? (
                        <> 
                            <span className="text-sm font-bold text-gray-500 uppercase">Resultados del Sorteo</span> 
                            <h3 className="text-2xl font-bold mt-2 text-gray-900">{data.winner.nombreRifa}</h3> 
                            <p className="text-sm text-gray-500 mt-1">Sorteo realizado el: {formatDate(data.winner.fechaRegistro)}</p> 
                            <div className="mt-8 bg-gray-100 rounded-lg py-6"> 
                                <p className="text-lg text-gray-600">Boleto Ganador:</p> 
                                <p className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 tracking-wider"> 
                                    {formatTicketNumber(data.winner.numeroGanador, data.totalBoletos)}
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
    const [rifasActivas, setRifasActivas] = useState([]); 
    const [rifasFinalizadas, setRifasFinalizadas] = useState([]);  
    const [cargando, setCargando] = useState(true);  
    const [isModalOpen, setIsModalOpen] = useState(false);  
    const [modalData, setModalData] = useState(null);  
    const [isLoadingModal, setIsLoadingModal] = useState(false);  
    const [paginaActivas, setPaginaActivas] = useState(1);
    const [paginaFinalizadas, setPaginaFinalizadas] = useState(1);
    const RIFAS_POR_PAGINA = 8;

    useEffect(() => {  
        const fetchAllRifas = async () => {  
            setCargando(true);  
            const qActivas = query(collection(db, "rifas"), where("estado", "==", RIFAS_ESTADOS.ACTIVA), orderBy("fechaCreacion", "desc"));  
            const qFinalizadas = query(collection(db, "rifas"), where("estado", "==", RIFAS_ESTADOS.FINALIZADA), orderBy("fechaCreacion", "desc"));  
            const [activasSnapshot, finalizadasSnapshot] = await Promise.all([getDocs(qActivas), getDocs(qFinalizadas)]);  
            const rifasActivasData = activasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); 
            setRifasActivas(rifasActivasData);
            const rifasFinalizadasData = finalizadasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));  
            setRifasFinalizadas(rifasFinalizadasData);  
            setCargando(false);  
        };  
        fetchAllRifas();  
    }, []);  

    const handleVerResultados = async (rifa) => { 
        setIsLoadingModal(true);  
        setIsModalOpen(true);  
        setModalData(null);  
        try {  
            const q = query(collection(db, 'ganadores'), where('rifaId', '==', rifa.id), limit(1));  
            const querySnapshot = await getDocs(q);  
            
            if (!querySnapshot.empty) {  
                const winnerDoc = querySnapshot.docs[0];
                setModalData({ winner: winnerDoc.data(), totalBoletos: rifa.boletos });  
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

    const totalPaginasActivas = Math.ceil(rifasActivas.length / RIFAS_POR_PAGINA);
    const inicioPaginacionActivas = (paginaActivas - 1) * RIFAS_POR_PAGINA;
    const finPaginacionActivas = inicioPaginacionActivas + RIFAS_POR_PAGINA;
    const rifasActivasPaginadas = rifasActivas.slice(inicioPaginacionActivas, finPaginacionActivas);
    const totalPaginasFinalizadas = Math.ceil(rifasFinalizadas.length / RIFAS_POR_PAGINA);
    const inicioPaginacionFinalizadas = (paginaFinalizadas - 1) * RIFAS_POR_PAGINA;
    const finPaginacionFinalizadas = inicioPaginacionFinalizadas + RIFAS_POR_PAGINA;
    const rifasFinalizadasPaginadas = rifasFinalizadas.slice(inicioPaginacionFinalizadas, finPaginacionFinalizadas);

    return (  
        <div className="bg-background-dark">
            <ResultadosModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} data={modalData} isLoading={isLoadingModal}/>  
            <HeroSection />  
            <main id="sorteos-activos" className="py-16 sm:py-20 bg-background-dark">  
                {cargando ? ( <div className="text-center py-20 text-text-subtle">Cargando...</div> ) : rifasActivas.length > 0 ? (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-4xl font-extrabold text-center mb-12 text-text-headings">Sorteos Disponibles</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {rifasActivasPaginadas.map(rifa => <RifaCard key={rifa.id} rifa={rifa} onShowResults={handleVerResultados} />)}
                        </div>
                        {totalPaginasActivas > 1 && (
                            <div className="mt-12 flex justify-center items-center gap-4">
                                <button onClick={() => setPaginaActivas(p => p - 1)} disabled={paginaActivas === 1} className="px-4 py-2 bg-background-light text-text-primary font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-90 transition-colors">
                                    Anterior
                                </button>
                                <span className="font-medium text-text-subtle">Página {paginaActivas} de {totalPaginasActivas}</span>
                                <button onClick={() => setPaginaActivas(p => p + 1)} disabled={paginaActivas === totalPaginasActivas} className="px-4 py-2 bg-background-light text-text-primary font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-90 transition-colors">
                                    Siguiente
                                </button>
                            </div>
                        )}
                    </div>
                ) : (  
                    <div className="text-center py-20">  
                        <h2 className="text-3xl font-bold text-text-headings">No hay sorteos disponibles</h2>  
                        <p className="text-text-subtle mt-2">¡Vuelve pronto para más oportunidades de ganar!</p>  
                    </div>  
                )}  
            </main>  
            {rifasFinalizadas.length > 0 && (  
                <div className="bg-background-dark pt-16 sm:pt-20 pb-16 border-t border-border-color">  
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">  
                        <h2 className="text-4xl font-extrabold text-center mb-12 text-text-headings">Sorteos Finalizados</h2>  
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">  
                            {rifasFinalizadasPaginadas.map(rifa => <RifaCard key={rifa.id} rifa={rifa} isFinished={true} onShowResults={handleVerResultados} />)}  
                        </div>  
                        {totalPaginasFinalizadas > 1 && (
                            <div className="mt-12 flex justify-center items-center gap-4">
                                <button onClick={() => setPaginaFinalizadas(p => p - 1)} disabled={paginaFinalizadas === 1} className="px-4 py-2 bg-background-light text-text-primary font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-90 transition-colors">
                                    Anterior
                                </button>
                                <span className="font-medium text-text-subtle">Página {paginaFinalizadas} de {totalPaginasFinalizadas}</span>
                                <button onClick={() => setPaginaFinalizadas(p => p + 1)} disabled={paginaFinalizadas === totalPaginasFinalizadas} className="px-4 py-2 bg-background-light text-text-primary font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-90 transition-colors">
                                    Siguiente
                                </button>
                            </div>
                        )}
                    </div>  
                </div>  
            )}  
            <PasosSection />  
        </div>  
    );  
}  

export default Home;
