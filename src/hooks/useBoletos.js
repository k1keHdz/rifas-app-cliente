import { useState, useCallback, useEffect } from 'react';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

/**
 * Hook centralizado para gestionar el estado de los boletos de una rifa específica.
 * Es la única fuente de verdad para los boletos seleccionados y ocupados.
 * @param {string} rifaId - El ID de la rifa a la que se le dará seguimiento.
 */
export const useBoletos = (rifaId) => {
    const [boletosSeleccionados, setBoletosSeleccionados] = useState([]);
    const [boletosOcupados, setBoletosOcupados] = useState(new Map());
    const [cargandoBoletos, setCargandoBoletos] = useState(true);

    // Efecto que escucha en tiempo real los boletos vendidos o apartados de la rifa.
    useEffect(() => {
        if (!rifaId) {
            setCargandoBoletos(false);
            return;
        }

        setCargandoBoletos(true);
        const ventasRef = collection(db, 'rifas', rifaId, 'ventas');
        const q = query(ventasRef, where("estado", "in", ["comprado", "apartado"]));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const ocupados = new Map();
            snapshot.forEach((doc) => {
                const venta = doc.data();
                if (venta.numeros && venta.estado) {
                    venta.numeros.forEach(num => ocupados.set(Number(num), venta.estado));
                }
            });
            setBoletosOcupados(ocupados);
            setCargandoBoletos(false);
        }, (error) => {
            console.error("[useBoletos] Error en listener de Firestore:", error);
            setCargandoBoletos(false);
        });

        return () => unsubscribe();
    }, [rifaId]);

    /**
     * Alterna la selección de un boleto. Memoizada con useCallback.
     * Lógica corregida para permitir siempre la deselección.
     */
    const toggleBoleto = useCallback((numero) => {
        const num = Number(numero);
        
        setBoletosSeleccionados(prev => {
            const yaEstaSeleccionado = prev.includes(num);

            if (yaEstaSeleccionado) {
                // Si ya está seleccionado, siempre permitir quitarlo.
                return prev.filter(n => n !== num);
            } else {
                // Si no está seleccionado, verificar si está ocupado antes de añadirlo.
                if (boletosOcupados.has(num)) {
                    console.warn(`Intento de seleccionar el boleto ocupado: ${num}`);
                    // No se añade, se devuelve el estado anterior.
                    return prev;
                }
                // Si no está ocupado, se añade a la selección.
                return [...prev, num];
            }
        });
    }, [boletosOcupados]);

    const limpiarSeleccion = useCallback(() => {
        setBoletosSeleccionados([]);
    }, []);

    const agregarBoletosEspecificos = useCallback((numerosNuevos) => {
        setBoletosSeleccionados(prev => {
            const nuevosNumerosFiltrados = numerosNuevos.filter(num => !boletosOcupados.has(num) && !prev.includes(num));
            return [...prev, ...nuevosNumerosFiltrados];
        });
    }, [boletosOcupados]);

    // ===== NUEVA FUNCIÓN =====
    // Función para quitar boletos específicos de la selección (usada para los conflictos).
    const removerBoletos = useCallback((numerosARemover) => {
        setBoletosSeleccionados(prev => prev.filter(n => !numerosARemover.includes(n)));
    }, []);

    return {
        boletosSeleccionados,
        boletosOcupados,
        cargandoBoletos,
        toggleBoleto,
        limpiarSeleccion,
        agregarBoletosEspecificos,
        removerBoletos, // Exportamos la nueva función
    };
};
