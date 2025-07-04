// src/components/rifas/ListaRifasMinimalista.js

import React from 'react';
// CORREGIDO: Ruta actualizada para el contexto
import { useRifas } from '../../context/RifasContext';
import { Link } from 'react-router-dom';
// CORREGIDO: Se eliminaron los iconos que no se usaban.

function ListaRifasMinimalista() {
    const { rifas, cargando } = useRifas();

    if (cargando) {
        return <p className="text-center text-text-subtle">Cargando sorteos...</p>;
    }

    return (
        <div className="bg-background-light rounded-xl shadow-lg p-4 sm:p-6 border border-border-color">
            <div className="space-y-3">
                {rifas.length > 0 ? (
                    rifas.map(rifa => (
                        <Link
                            key={rifa.id}
                            to={`/admin/historial-ventas/${rifa.id}`}
                            className="block p-4 border border-border-color rounded-lg hover:bg-border-color/20 hover:border-accent-primary/50 transition-all duration-200"
                        >
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-lg">{rifa.nombre}</span>
                                <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                    rifa.estado === 'activa' ? 'bg-success/20 text-success' :
                                    rifa.estado === 'pendiente' ? 'bg-warning/20 text-warning' : 'bg-danger/20 text-danger'
                                }`}>
                                    {rifa.estado}
                                </span>
                            </div>
                        </Link>
                    ))
                ) : (
                    <p className="text-center text-text-subtle py-4">No se han encontrado sorteos.</p>
                )}
            </div>
        </div>
    );
}

export default ListaRifasMinimalista;
