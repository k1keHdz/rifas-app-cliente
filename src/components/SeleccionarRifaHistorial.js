import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { Link } from 'react-router-dom';
import { FaTicketAlt, FaCalendarAlt } from 'react-icons/fa';

function SeleccionarRifaHistorial() {
    const [rifas, setRifas] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'rifas'), orderBy('fechaCreacion', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setRifas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setCargando(false);
        }, (error) => {
            console.error("Error al cargar sorteos:", error);
            setCargando(false);
        });
        return () => unsubscribe();
    }, []);

    return (
        <div className="bg-background-dark p-4 sm:p-8 max-w-4xl mx-auto min-h-screen">
            <Link to="/admin" className="text-accent-primary hover:underline mb-8 inline-block">
                ← Volver al Panel
            </Link>
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold">Historial de Ventas</h1>
                <p className="mt-2 text-lg text-text-subtle">Selecciona un sorteo para ver su historial detallado.</p>
            </div>
            
            <div className="space-y-4">
                {cargando ? (
                    <p className="text-center text-text-subtle">Cargando sorteos...</p>
                ) : (
                    rifas.map(rifa => (
                        <Link 
                            key={rifa.id} 
                            to={`/admin/historial-ventas/${rifa.id}`} 
                            className="block bg-background-light p-4 rounded-lg border border-border-color shadow-md hover:shadow-xl hover:border-accent-primary transition-all duration-300"
                        >
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold">{rifa.nombre}</h3>
                                <span className={`px-3 py-1 text-xs font-bold rounded-full text-white capitalize ${
                                    rifa.estado === 'activa' ? 'bg-success' : 
                                    rifa.estado === 'pendiente' ? 'bg-warning' : 'bg-danger'
                                }`}>
                                    {rifa.estado}
                                </span>
                            </div>
                            <div className="flex items-center text-sm text-text-subtle mt-2 gap-4">
                                <span className="flex items-center"><FaTicketAlt className="mr-2" /> {rifa.boletos} boletos</span>
                                <span className="flex items-center"><FaCalendarAlt className="mr-2" /> Creado: {new Date(rifa.fechaCreacion?.seconds * 1000).toLocaleDateString()}</span>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}

export default SeleccionarRifaHistorial;
