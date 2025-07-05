import React from 'react';
import { formatTicketNumber } from '../../utils/rifaHelper';

const SelectorBoletos = ({
    boletosOcupados,
    boletosSeleccionados,
    conflictingTickets = [],
    onToggleBoleto,
    filtroActivo,
    rangoInicio,
    rangoFin,
    totalBoletos,
    compraActiva
}) => {

    const numerosAMostrar = Array.from({ length: rangoFin - rangoInicio }, (_, i) => rangoInicio + i);

    return (
        <div className="mt-2 w-full">
            <div className="overflow-auto max-h-[500px] p-2 bg-background-dark rounded-lg border border-border-color">
                <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-10 gap-1 sm:gap-1.5 w-max mx-auto">
                    {numerosAMostrar.map(numeroBoleto => {
                        const estaOcupado = boletosOcupados.has(numeroBoleto);

                        if (filtroActivo && estaOcupado) {
                            return null;
                        }

                        const estaSeleccionado = boletosSeleccionados.includes(numeroBoleto);
                        const esConflicto = conflictingTickets.includes(numeroBoleto);

                        let colorClasses = '';

                        if (estaSeleccionado) {
                            colorClasses = 'bg-green-500 text-white border-green-600 scale-110 shadow-lg';
                        } else if (estaOcupado) {
                            const estado = boletosOcupados.get(numeroBoleto);
                            colorClasses = estado === 'apartado' 
                                ? 'bg-yellow-400 text-black border-yellow-500 cursor-not-allowed opacity-80'
                                : 'bg-red-600 text-white border-red-700 cursor-not-allowed opacity-80';
                        } else {
                            colorClasses = 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100';
                        }
                        
                        if (esConflicto) {
                            colorClasses += ' animate-pulse ring-4 ring-offset-2 ring-danger ring-offset-background-dark';
                        }
                        
                        const isDisabled = !compraActiva || estaOcupado;

                        return (
                            <button
                                key={numeroBoleto}
                                onClick={() => onToggleBoleto(numeroBoleto)}
                                className={`border w-14 h-10 sm:w-12 rounded text-xs sm:text-sm font-mono transition-all transform ${colorClasses} ${!isDisabled && 'hover:scale-110'}`}
                                disabled={isDisabled}
                            >
                                {formatTicketNumber(numeroBoleto, totalBoletos)}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default React.memo(SelectorBoletos);