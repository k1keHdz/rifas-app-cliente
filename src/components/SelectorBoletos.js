// src/components/SelectorBoletos.js
import React from 'react';

const SelectorBoletos = ({
  boletosOcupados,
  boletosSeleccionados,
  onToggleBoleto,
  filtroActivo,
  rangoInicio,
  rangoFin,
  // ==================================================================
  // INICIO DE CAMBIOS: Recibimos el padding dinámico como prop
  // ==================================================================
  paddingLength, 
  numerosFiltrados // Para cuando se usa el buscador
  // ==================================================================
  // FIN DE CAMBIOS
  // ==================================================================
}) => {
  
  // Eliminamos el paddingLength fijo de aquí

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
                {/* ================================================================== */}
                {/* INICIO DE CAMBIOS: Usamos el padding dinámico */}
                {/* ================================================================== */}
                {String(numeroBoleto).padStart(paddingLength, '0')}
                {/* ================================================================== */}
                {/* FIN DE CAMBIOS */}
                {/* ================================================================== */}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default React.memo(SelectorBoletos);