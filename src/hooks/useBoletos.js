// src/hooks/useBoletos.js
// VERSIÓN RECONSTRUIDA: Este hook ahora solo gestiona la SELECCIÓN de boletos.
// Ya no se conecta a Firestore. Su lógica es simple y estable.

import { useState, useCallback } from 'react';

export const useBoletos = () => {
    const [boletosSeleccionados, setBoletosSeleccionados] = useState([]);

    // La función ahora recibe los boletos ocupados para hacer la validación
    const toggleBoleto = useCallback((numero, boletosOcupados) => {
        if (boletosOcupados.has(Number(numero))) return;
        setBoletosSeleccionados(prev => 
            prev.includes(numero) 
                ? prev.filter(n => n !== numero) 
                : [...prev, numero]
        );
    }, []);

    const limpiarSeleccion = useCallback(() => {
        setBoletosSeleccionados([]);
    }, []);

    // Esta función ahora es manejada por el componente padre que tiene la lista completa de seleccionados
    const agregarBoletosEspecificos = useCallback((numerosNuevos) => {
        setBoletosSeleccionados(prev => [...new Set([...prev, ...numerosNuevos])]);
    }, []);

    return {
        boletosSeleccionados,
        setBoletosSeleccionados, // Exportamos el setter para usos avanzados
        toggleBoleto,
        limpiarSeleccion,
        agregarBoletosEspecificos,
    };
};
