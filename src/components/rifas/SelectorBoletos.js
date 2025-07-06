// src/components/rifas/SelectorBoletos.js

import React, { useMemo, useEffect, useState, useRef } from 'react';
import { formatTicketNumber } from '../../utils/rifaHelper';
import { FixedSizeList as List } from 'react-window';

// Componente para una fila individual, memoizado para máximo rendimiento.
const Row = React.memo(({ index, style, data }) => {
    const {
        itemsPerRow,
        totalBoletos,
        boletosOcupados,
        boletosSeleccionados,
        conflictingTickets,
        onToggleBoleto,
        compraActiva,
        filtroActivo,
    } = data;

    const items = [];
    const startIndex = index * itemsPerRow;

    for (let i = 0; i < itemsPerRow; i++) {
        const numeroBoleto = startIndex + i;
        if (numeroBoleto >= totalBoletos) break;

        const estadoBoleto = boletosOcupados.get(numeroBoleto);
        const estaOcupado = !!estadoBoleto;

        // ===== LÓGICA MEJORADA PARA EL FILTRO =====
        if (filtroActivo && estaOcupado) {
            // Si el filtro está activo, renderizamos un bloque negro placeholder.
            items.push(
                <div key={`placeholder-${numeroBoleto}`} className="border w-14 h-10 sm:w-12 rounded bg-black border-gray-800"></div>
            );
            continue;
        }
        
        const estaSeleccionado = boletosSeleccionados.includes(numeroBoleto);
        const esConflicto = conflictingTickets.includes(numeroBoleto);
        const isDisabled = !compraActiva || estaOcupado;

        let colorClasses = '';
        if (esConflicto) {
            colorClasses = 'animate-pulse ring-4 ring-offset-2 ring-danger ring-offset-background-dark';
        } else if (estaSeleccionado) {
            colorClasses = 'bg-green-500 text-white border-green-600 scale-110 shadow-lg';
        } else if (estadoBoleto === 'apartado') {
            colorClasses = 'bg-yellow-400 text-black border-yellow-500 cursor-not-allowed opacity-80';
        } else if (estadoBoleto === 'comprado') {
            colorClasses = 'bg-red-600 text-white border-red-700 cursor-not-allowed opacity-80';
        } else {
            colorClasses = 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100';
        }

        items.push(
            <button
                key={numeroBoleto}
                onClick={() => onToggleBoleto(numeroBoleto)}
                disabled={isDisabled}
                className={`border w-14 h-10 sm:w-12 rounded text-xs sm:text-sm font-mono transition-all transform ${colorClasses} ${!isDisabled && 'hover:scale-110'}`}
            >
                {formatTicketNumber(numeroBoleto, totalBoletos)}
            </button>
        );
    }

    return (
        <div style={style} className="flex justify-center items-center gap-1.5 px-1">
            {items}
        </div>
    );
});


const SelectorBoletos = ({
    totalBoletos,
    boletosOcupados,
    boletosSeleccionados,
    conflictingTickets = [],
    onToggleBoleto,
    filtroActivo,
    compraActiva
}) => {
    const listContainerRef = useRef(null);
    const [listWidth, setListWidth] = useState(0);

    const itemsPerRow = useMemo(() => {
        if (listWidth === 0) return 10;
        return Math.max(1, Math.floor(listWidth / (58))); // 58px = ancho aproximado del botón + gap
    }, [listWidth]);
    
    // El rowCount siempre se basa en el total para mantener la estructura del scroll.
    const rowCount = useMemo(() => Math.ceil(totalBoletos / itemsPerRow), [totalBoletos, itemsPerRow]);

    useEffect(() => {
        if (listContainerRef.current) {
            setListWidth(listContainerRef.current.offsetWidth);
        }
        const handleResize = () => {
            if (listContainerRef.current) {
                setListWidth(listContainerRef.current.offsetWidth);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="mt-2 w-full">
            <div ref={listContainerRef} className="h-[600px] p-2 bg-background-dark rounded-lg border border-border-color">
                {listWidth > 0 && (
                     <List
                        height={580}
                        itemCount={rowCount}
                        itemSize={46} // Altura de la fila + gap
                        width="100%"
                        itemData={{
                            itemsPerRow,
                            totalBoletos,
                            boletosOcupados,
                            boletosSeleccionados,
                            conflictingTickets,
                            onToggleBoleto,
                            compraActiva,
                            filtroActivo,
                        }}
                    >
                        {Row}
                    </List>
                )}
            </div>
        </div>
    );
};

export default React.memo(SelectorBoletos);
