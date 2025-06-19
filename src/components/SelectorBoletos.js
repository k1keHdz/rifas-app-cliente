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
            let colorClasses = 'bg-background-light text-text-subtle border-border-color hover:bg-border-color/50';

            if (estaSeleccionado) {
              // REPARACIÓN: Se usa bg-accent-primary y el texto sobre acento para consistencia.
              colorClasses = 'bg-accent-primary text-text-on-accent border-accent-primary scale-110 shadow-lg';
            } else if (estaOcupado) {
              const estado = boletosOcupados.get(numeroBoleto);
              // REPARACIÓN: Se usan los colores semánticos del tema para claridad.
              if (estado === 'apartado') {
                colorClasses = 'bg-warning text-text-dark border-warning cursor-not-allowed opacity-70';
              } else {
                colorClasses = 'bg-danger text-white border-danger cursor-not-allowed opacity-70';
              }
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
