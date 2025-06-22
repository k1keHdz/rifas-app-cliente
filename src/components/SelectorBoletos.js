// src/components/SelectorBoletos.js
import React from 'react';
import { formatTicketNumber } from '../utils/rifaHelper';

const SelectorBoletos = ({
  boletosOcupados,
  boletosSeleccionados,
  onToggleBoleto,
  filtroActivo,
  rangoInicio,
  rangoFin,
  totalBoletos,
  numerosFiltrados
}) => {

  const numerosAMostrar = numerosFiltrados || Array.from({ length: rangoFin - rangoInicio }, (_, i) => rangoInicio + i);

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
            let colorClasses = '';

            // LÓGICA DE COLOR CORREGIDA CON CLASES FIJAS E INDEPENDIENTES DEL TEMA
            if (estaSeleccionado) {
              // Estado: Seleccionado (Verde Fijo)
              colorClasses = 'bg-green-500 text-white border-green-600 scale-110 shadow-lg';
            } else if (estaOcupado) {
              const estado = boletosOcupados.get(numeroBoleto);
              if (estado === 'apartado') {
                // Estado: Apartado (Amarillo Fijo)
                colorClasses = 'bg-yellow-400 text-black border-yellow-500 cursor-not-allowed opacity-80';
              } else {
                // Estado: Pagado (Rojo Fijo)
                colorClasses = 'bg-red-600 text-white border-red-700 cursor-not-allowed opacity-80';
              }
            } else {
              // Estado: Disponible (Blanco Fijo)
              colorClasses = 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100';
            }
            
            return (
              <button
                key={numeroBoleto}
                onClick={() => onToggleBoleto(numeroBoleto)}
                className={`border w-14 h-10 sm:w-12 rounded text-xs sm:text-sm font-mono transition-transform transform ${colorClasses}`}
                disabled={estaOcupado}
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
