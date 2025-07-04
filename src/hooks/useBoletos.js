// src/hooks/useBoletos.js

import { useState, useCallback } from 'react';

export const useBoletos = () => {
    const [boletosSeleccionados, setBoletosSeleccionados] = useState([]);

    // CORREGIDO: La lógica ahora es más robusta y segura.
    const toggleBoleto = useCallback((numero, boletosOcupados) => {
        const num = Number(numero);
        const isAlreadySelected = boletosSeleccionados.includes(num);

        if (isAlreadySelected) {
            // Si ya está seleccionado, el usuario quiere DESELECCIONARLO.
            // Siempre se permite la deselección, sin importar el estado del boleto.
            setBoletosSeleccionados(prev => prev.filter(n => n !== num));
        } else {
            // Si no está seleccionado, el usuario quiere SELECCIONARLO.
            // Aquí es donde verificamos si está disponible.
            // Se añade una comprobación para asegurar que boletosOcupados existe.
            if (boletosOcupados && boletosOcupados.has(num)) {
                // Si está ocupado, no hacemos nada.
                console.warn(`Intento de seleccionar el boleto ocupado: ${num}`);
                return;
            }
            // Si está disponible, lo añadimos a la selección.
            setBoletosSeleccionados(prev => [...prev, num]);
        }
    // Se añade boletosSeleccionados como dependencia para que la función siempre tenga la lista más actualizada.
    }, [boletosSeleccionados]);

    const limpiarSeleccion = useCallback(() => {
        setBoletosSeleccionados([]);
    }, []);

    const agregarBoletosEspecificos = useCallback((numerosNuevos) => {
        setBoletosSeleccionados(prev => {
            const nuevosNumerosSet = new Set(numerosNuevos);
            const union = new Set([...prev, ...nuevosNumerosSet]);
            return Array.from(union);
        });
    }, []);

    return {
        boletosSeleccionados,
        setBoletosSeleccionados,
        toggleBoleto,
        limpiarSeleccion,
        agregarBoletosEspecificos,
    };
};
