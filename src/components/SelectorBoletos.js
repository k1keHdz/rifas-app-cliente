// src/components/SelectorBoletos.js
import React from 'react';
import { formatTicketNumber } from '../utils/rifaHelper'; // Importamos la nueva función

const SelectorBoletos = ({
  boletosOcupados,
  boletosSeleccionados,
  onToggleBoleto,
  filtroActivo,
  rangoInicio,
  rangoFin,
  totalBoletos, // Recibimos el total de boletos
  numerosFiltrados 
}) => {
  
  // Creamos la lista de números a mostrar, ya sea del rango o de la búsqueda
  const numerosAMostrar = numerosFiltrados || Array.from({ length: rangoFin - rangoInicio }, (_, i) => rangoInicio + i);

  return (
    <div className="mt-2 w-full">
      <div className="overflow-auto max-h-[500px] p-2 bg-gray-50 rounded-lg border">
        <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-10 gap-1 sm:gap-1.5 w-max mx-auto">
          {numerosAMostrar.map(numeroBoleto => {
            const estaOcupado = boletosOcupados.has(numeroBoleto);

            if (filtroActivo && estaOcupado) {
              return null;
            }

            const estaSeleccionado = boletosSeleccionados.includes(numeroBoleto);
            let color = 'bg-white text-gray-800 border-gray-300 hover:bg-gray-200';

            if (estaSeleccionado) {
              color = 'bg-green-600 text-white border-green-700';
            } else if (estaOcupado) {
              const estado = boletosOcupados.get(numeroBoleto);
              if (estado === 'apartado') {
                color = 'bg-yellow-400 text-black border-yellow-500 cursor-not-allowed';
              } else {
                color = 'bg-red-600 text-white border-red-700 cursor-not-allowed';
              }
            }
            
            return (
              <button
                key={numeroBoleto}
                onClick={() => onToggleBoleto(numeroBoleto)}
                className={`border w-14 h-10 sm:w-12 rounded text-xs sm:text-sm font-mono transition-transform transform hover:scale-110 ${color}`}
                disabled={estaOcupado}
              >
                {/* Usamos la nueva función de formato centralizada */}
                {formatTicketNumber(numeroBoleto, totalBoletos)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// React.memo sigue siendo útil para evitar re-renderizados innecesarios.
export default React.memo(SelectorBoletos);
