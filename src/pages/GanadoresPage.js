// src/pages/GanadoresPage.js

import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, getDocs, where } from 'firebase/firestore';
// CORREGIDO: Ruta actualizada
import { db } from '../config/firebaseConfig';
import { formatTicketNumber } from '../utils/rifaHelper';

// Íconos
const TrophyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M5.58 11.25a2.5 2.5 0 0 1-2.45-2.5 2.5 2.5 0 0 1 2.5-2.5c1.28 0 2.45.98 2.5 2.25a2.5 2.5 0 0 1-2.5 2.5z"/><path d="M18.42 11.25a2.5 2.5 0 0 1-2.45-2.5 2.5 2.5 0 0 1 2.5-2.5c1.28 0 2.45.98 2.5 2.25a2.5 2.5 0 0 1-2.5 2.5z"/></svg>;
const VideoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>;
const MapPinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-1.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;


const VideoModal = ({ videoUrl, onClose }) => {
    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4 animate-fade-in"
            onClick={onClose}
        >
            <div className="relative w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
                <video className="w-full h-auto rounded-lg" controls autoPlay>
                    <source src={videoUrl} type="video/mp4" />
                    Tu navegador no soporta la etiqueta de video.
                </video>
                <button 
                    onClick={onClose}
                    className="absolute -top-4 -right-4 bg-white text-black w-8 h-8 rounded-full flex items-center justify-center text-xl font-bold"
                >
                    &times;
                </button>
            </div>
        </div>
    );
};


function GanadoresPage() {
    const [ganadores, setGanadores] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [videoModalUrl, setVideoModalUrl] = useState(null);
    const [rifasDetails, setRifasDetails] = useState({});

    useEffect(() => {
        const q = query(collection(db, "ganadores"), orderBy("fechaRegistro", "desc"));
        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const ganadoresData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setGanadores(ganadoresData);

            if (ganadoresData.length > 0) {
                const rifaIds = [...new Set(ganadoresData.map(g => g.rifaId))].filter(id => id);
                if (rifaIds.length > 0) {
                    const rifasQuery = query(collection(db, 'rifas'), where('__name__', 'in', rifaIds));
                    const rifasSnapshot = await getDocs(rifasQuery);
                    const details = {};
                    rifasSnapshot.forEach(doc => {
                        details[doc.id] = doc.data();
                    });
                    setRifasDetails(details);
                }
            }
            
            setCargando(false);
        });
        return () => unsubscribe();
    }, []);

    return (
        <>
            <div className="bg-background-dark py-12 sm:py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-base font-semibold text-text-subtle tracking-wide uppercase">Nuestros Afortunados</h2>
                        <p className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
                            Galería de Ganadores
                        </p>
                        <p className="mt-4 max-w-2xl mx-auto text-xl text-text-subtle">
                            ¡Felicidades a todos nuestros ganadores! Tú podrías ser el siguiente.
                        </p>
                    </div>

                    <div className="mt-12">
                        {cargando ? (
                            <p className="text-center">Cargando ganadores...</p>
                        ) : ganadores.length === 0 ? (
                            <p className="text-center text-text-subtle">Aún no hay ganadores registrados. ¡Participa para ser el primero!</p>
                        ) : (
                            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                {ganadores.map(ganador => {
                                    const totalBoletos = rifasDetails[ganador.rifaId]?.boletos || 100;
                                    return(
                                        <div key={ganador.id} className="flex flex-col rounded-lg shadow-lg overflow-hidden bg-background-light border border-border-color">
                                            <div className="flex-shrink-0">
                                                <img className="h-64 w-full object-cover" src={ganador.fotoURL} alt={`Ganador ${ganador.datosComprador.nombre}`} />
                                            </div>
                                            <div className="flex-1 p-6 flex flex-col justify-between">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-text-subtle flex items-center">
                                                        <TrophyIcon />
                                                        <span className="ml-1">Ganador del Sorteo</span>
                                                    </p>
                                                    <p className="block mt-2 text-xl font-semibold">{ganador.nombreRifa}</p>
                                                    {ganador.testimonio && (
                                                        <p className="mt-3 text-base text-text-subtle italic">"{ganador.testimonio}"</p>
                                                    )}
                                                </div>
                                                <div className="mt-6 flex flex-col">
                                                    <div className="flex items-center mb-4">
                                                        <div>
                                                            <p className="text-lg font-semibold">{ganador.datosComprador.nombre}</p>
                                                            {ganador.datosComprador.estado && (
                                                                <p className="text-sm text-text-subtle flex items-center">
                                                                    <MapPinIcon/>
                                                                    {ganador.datosComprador.estado}
                                                                </p>
                                                            )}
                                                            <div className="flex space-x-1 text-sm text-text-subtle mt-1">
                                                                <span>Boleto Ganador:</span>
                                                                <span className="font-mono">{formatTicketNumber(ganador.numeroGanador, totalBoletos)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {ganador.videoURL && (
                                                        <button 
                                                            onClick={() => setVideoModalUrl(ganador.videoURL)}
                                                            className="w-full flex items-center justify-center bg-background-dark border border-border-color font-bold py-2 px-4 rounded-lg hover:bg-border-color transition-colors"
                                                        >
                                                            <VideoIcon/>
                                                            Ver Video del Ganador
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {videoModalUrl && (
                <VideoModal videoUrl={videoModalUrl} onClose={() => setVideoModalUrl(null)} />
            )}
        </>
    );
}

export default GanadoresPage;
