// src/pages/GanadoresPage.js

import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { Link } from 'react-router-dom';

// Íconos
const TrophyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M5.58 11.25a2.5 2.5 0 0 1-2.45-2.5 2.5 2.5 0 0 1 2.5-2.5c1.28 0 2.45.98 2.5 2.25a2.5 2.5 0 0 1-2.5 2.5z"/><path d="M18.42 11.25a2.5 2.5 0 0 1-2.45-2.5 2.5 2.5 0 0 1 2.5-2.5c1.28 0 2.45.98 2.5 2.25a2.5 2.5 0 0 1-2.5 2.5z"/></svg>;
const VideoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>;

// ==================================================================
// INICIO DE CAMBIOS: Nuevo componente para el Modal de Video
// ==================================================================
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
// ==================================================================
// FIN DE CAMBIOS
// ==================================================================


function GanadoresPage() {
  const [ganadores, setGanadores] = useState([]);
  const [cargando, setCargando] = useState(true);
  // ==================================================================
  // INICIO DE CAMBIOS: Nuevo estado para controlar el modal de video
  // ==================================================================
  const [videoModalUrl, setVideoModalUrl] = useState(null);
  // ==================================================================
  // FIN DE CAMBIOS
  // ==================================================================

  useEffect(() => {
    const q = query(collection(db, "ganadores"), orderBy("fechaRegistro", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ganadoresData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGanadores(ganadoresData);
      setCargando(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <>
      <div className="bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">Nuestros Afortunados</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
              Galería de Ganadores
            </p>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              ¡Felicidades a todos nuestros ganadores! Tú podrías ser el siguiente.
            </p>
          </div>

          <div className="mt-12">
            {cargando ? (
              <p className="text-center">Cargando ganadores...</p>
            ) : ganadores.length === 0 ? (
              <p className="text-center text-gray-600">Aún no hay ganadores registrados. ¡Participa para ser el primero!</p>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {ganadores.map(ganador => (
                  <div key={ganador.id} className="flex flex-col rounded-lg shadow-lg overflow-hidden">
                    <div className="flex-shrink-0">
                      <img className="h-64 w-full object-cover" src={ganador.fotoURL} alt={`Ganador ${ganador.datosComprador.nombre}`} />
                    </div>
                    <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-600 flex items-center">
                          <TrophyIcon />
                          <span className="ml-1">Ganador de la Rifa</span>
                        </p>
                        <Link to={`/rifas/${ganador.rifaId}`} className="block mt-2">
                          <p className="text-xl font-semibold text-gray-900 hover:underline">{ganador.nombreRifa}</p>
                        </Link>
                        {ganador.testimonio && (
                          <p className="mt-3 text-base text-gray-500 italic">"{ganador.testimonio}"</p>
                        )}
                      </div>
                      <div className="mt-6 flex flex-col">
                        <div className="flex items-center mb-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{ganador.datosComprador.nombre}</p>
                            <div className="flex space-x-1 text-sm text-gray-500">
                              <span>Boleto Ganador:</span>
                              <span className="font-mono">{String(ganador.numeroGanador).padStart(5, '0')}</span>
                            </div>
                          </div>
                        </div>
                        {/* ================================================================== */}
                        {/* INICIO DE CAMBIOS: Botón condicional para ver el video */}
                        {/* ================================================================== */}
                        {ganador.videoURL && (
                            <button 
                                onClick={() => setVideoModalUrl(ganador.videoURL)}
                                className="w-full flex items-center justify-center bg-gray-800 text-white font-bold py-2 px-4 rounded-lg hover:bg-black transition-colors"
                            >
                                <VideoIcon/>
                                Ver Video del Ganador
                            </button>
                        )}
                        {/* ================================================================== */}
                        {/* FIN DE CAMBIOS */}
                        {/* ================================================================== */}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* INICIO DE CAMBIOS: Renderizado del modal de video */}
      {/* ================================================================== */}
      {videoModalUrl && (
        <VideoModal videoUrl={videoModalUrl} onClose={() => setVideoModalUrl(null)} />
      )}
      {/* ================================================================== */}
      {/* FIN DE CAMBIOS */}
      {/* ================================================================== */}
    </>
  );
}

export default GanadoresPage;