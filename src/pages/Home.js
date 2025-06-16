// src/pages/Home.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { RIFAS_ESTADOS } from '../constants/rifas';

// --- Sub-componente para las tarjetas de rifas ---
const RifaCard = ({ rifa }) => {
    const porcentajeVendido = rifa.boletos > 0 ? ((rifa.boletosVendidos || 0) / rifa.boletos) * 100 : 0;
    return (
        <Link to={`/rifas/${rifa.id}`} className="block group">
            <div className="w-full bg-gray-200 rounded-lg overflow-hidden">
                <img
                    src={rifa.imagen}
                    alt={rifa.nombre}
                    className="w-full h-full h-48 object-cover group-hover:opacity-75 transition-opacity"
                />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-800">{rifa.nombre}</h3>
            <p className="mt-1 text-2xl font-bold text-blue-600">${rifa.precio.toLocaleString('es-MX')}</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${porcentajeVendido}%` }}></div>
            </div>
            <p className="text-sm text-gray-500 mt-1">{porcentajeVendido.toFixed(1)}% vendido</p>
        </Link>
    );
};

// --- Sub-componente para la sección de "Cómo participar" ---
const PasosSection = () => (
    <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
                <h2 className="text-3xl font-extrabold text-gray-900">Participar es Muy Fácil</h2>
                <p className="mt-4 text-lg text-gray-500">Sigue estos simples pasos y podrías ser nuestro próximo ganador.</p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                <div className="text-center">
                    <div className="flex items-center justify-center h-12 w-12 mx-auto bg-blue-600 text-white rounded-full">1</div>
                    <h3 className="mt-5 text-lg font-medium text-gray-900">Elige tu Rifa</h3>
                    <p className="mt-2 text-base text-gray-500">Explora nuestras rifas activas y selecciona el premio que más te guste.</p>
                </div>
                <div className="text-center">
                    <div className="flex items-center justify-center h-12 w-12 mx-auto bg-blue-600 text-white rounded-full">2</div>
                    <h3 className="mt-5 text-lg font-medium text-gray-900">Selecciona Boletos</h3>
                    <p className="mt-2 text-base text-gray-500">Usa el tablero interactivo para escoger tus números de la suerte.</p>
                </div>
                <div className="text-center">
                    <div className="flex items-center justify-center h-12 w-12 mx-auto bg-blue-600 text-white rounded-full">3</div>
                    <h3 className="mt-5 text-lg font-medium text-gray-900">Aparta y Paga</h3>
                    <p className="mt-2 text-base text-gray-500">Contáctanos por WhatsApp para apartar tus boletos y recibir los datos de pago.</p>
                </div>
                <div className="text-center">
                    <div className="flex items-center justify-center h-12 w-12 mx-auto bg-blue-600 text-white rounded-full">4</div>
                    <h3 className="mt-5 text-lg font-medium text-gray-900">¡Espera y Gana!</h3>
                    <p className="mt-2 text-base text-gray-500">Verifica tu boleto y espera el día del sorteo. ¡Mucha suerte!</p>
                </div>
            </div>
        </div>
    </div>
);


function Home() {
    const [rifaDestacada, setRifaDestacada] = useState(null);
    const [otrasRifas, setOtrasRifas] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const fetchRifas = async () => {
            setCargando(true);
            try {
                const q = query(
                    collection(db, "rifas"), 
                    where("estado", "==", RIFAS_ESTADOS.ACTIVA),
                    orderBy("fechaCreacion", "desc"),
                    limit(4) // Traemos las 4 más recientes
                );
                const querySnapshot = await getDocs(q);
                const rifasData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                if (rifasData.length > 0) {
                    setRifaDestacada(rifasData[0]); // La primera es la destacada
                    setOtrasRifas(rifasData.slice(1)); // El resto son las "otras"
                }
            } catch (error) {
                console.error("Error al cargar las rifas: ", error);
            } finally {
                setCargando(false);
            }
        };

        fetchRifas();
    }, []);


    return (
        <div>
            {cargando ? (
                <div className="text-center py-40">Cargando...</div>
            ) : rifaDestacada ? (
                <div className="relative bg-gray-800">
                    <div className="absolute inset-0">
                        <img className="w-full h-full object-cover" src={rifaDestacada.imagen} alt={rifaDestacada.nombre} />
                        <div className="absolute inset-0 bg-gray-800 mix-blend-multiply" aria-hidden="true" />
                    </div>
                    <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8 text-center">
                        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">{rifaDestacada.nombre}</h1>
                        <p className="mt-6 max-w-lg mx-auto text-xl text-indigo-100">
                           ¡No dejes pasar esta oportunidad! Sé el próximo en ganar este increíble premio.
                        </p>
                        <Link
                            to={`/rifas/${rifaDestacada.id}`}
                            className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 sm:w-auto"
                        >
                            ¡Participar ahora!
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="bg-gray-800 text-white text-center py-20 sm:py-32">
                    <div className="max-w-4xl mx-auto px-4">
                        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">La Suerte Está a un Boleto de Distancia</h1>
                        <p className="mt-4 text-lg sm:text-xl text-gray-300">Participa en nuestras rifas exclusivas y gana premios increíbles.</p>
                        <Link to="/rifas" className="mt-8 inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105">
                            Ver Rifas Disponibles
                        </Link>
                    </div>
                </div>
            )}

            <PasosSection />

            {otrasRifas.length > 0 && (
                <div className="bg-gray-50 py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-extrabold text-gray-900 text-center">Más Oportunidades Para Ganar</h2>
                        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {otrasRifas.map(rifa => (
                                <RifaCard key={rifa.id} rifa={rifa} />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;