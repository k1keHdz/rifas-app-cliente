// src/hooks/useBoletos.js
import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

export const useBoletos = (rifaId) => {
  const [boletosOcupados, setBoletosOcupados] = useState(new Map());
  const [boletosSeleccionados, setBoletosSeleccionados] = useState([]);
  const [cargandoBoletos, setCargandoBoletos] = useState(true);

  useEffect(() => {
    if (!rifaId) return;
    setCargandoBoletos(true);

    const ventasRef = collection(db, 'rifas', rifaId, 'ventas');
    const q = query(ventasRef, where("estado", "in", ["comprado", "apartado"]));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ocupados = new Map();
      snapshot.forEach((doc) => {
        const venta = doc.data();
        if (venta.numeros && venta.estado) {
          venta.numeros.forEach(num => {
            ocupados.set(num, venta.estado);
          });
        }
      });
      setBoletosOcupados(ocupados);
      setCargandoBoletos(false);
    }, (error) => {
      console.error("[useBoletos] Error en el listener de onSnapshot:", error);
      setCargandoBoletos(false);
    });

    return () => unsubscribe();
  }, [rifaId]);
  
  const toggleBoleto = useCallback((numero) => {
    if (boletosOcupados.has(numero)) return;
    setBoletosSeleccionados(prev => prev.includes(numero) ? prev.filter(n => n !== numero) : [...prev, numero]);
  }, [boletosOcupados]);

  const seleccionarBoleto = useCallback((numero) => {
    if (boletosOcupados.has(numero) || boletosSeleccionados.includes(numero)) return;
    setBoletosSeleccionados(prev => [...prev, numero]);
  }, [boletosOcupados, boletosSeleccionados]);

  const limpiarSeleccion = useCallback(() => {
    setBoletosSeleccionados([]);
  }, []);

  // ==================================================================
  // INICIO DE CAMBIOS: Lógica completa para la Máquina de la Suerte
  // ==================================================================
  const agregarMultiplesBoletos = useCallback((cantidad, totalBoletos) => {
    // 1. Crear una lista de TODOS los números posibles para la rifa (de 0 a total-1)
    const todosLosNumeros = Array.from({ length: totalBoletos }, (_, i) => i);

    // 2. Filtrar para obtener solo los boletos verdaderamente disponibles
    const boletosDisponibles = todosLosNumeros.filter(
      num => !boletosOcupados.has(num) && !boletosSeleccionados.includes(num)
    );

    // 3. Verificar si hay suficientes boletos disponibles
    if (boletosDisponibles.length < cantidad) {
      alert(`¡No hay suficientes boletos disponibles! Solo quedan ${boletosDisponibles.length}.`);
      return;
    }

    // 4. Barajar la lista de boletos disponibles (Algoritmo Fisher-Yates)
    for (let i = boletosDisponibles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [boletosDisponibles[i], boletosDisponibles[j]] = [boletosDisponibles[j], boletosDisponibles[i]];
    }

    // 5. Tomar la cantidad deseada de la lista barajada
    const nuevosBoletos = boletosDisponibles.slice(0, cantidad);

    // 6. Añadir los nuevos boletos a la selección existente, evitando duplicados
    setBoletosSeleccionados(prev => [...new Set([...prev, ...nuevosBoletos])]);

  }, [boletosOcupados, boletosSeleccionados]);

   const agregarBoletosEspecificos = useCallback((numerosNuevos) => {
    const boletosParaAgregar = Array.isArray(numerosNuevos) ? numerosNuevos : [];
    // Filtramos para no agregar boletos que ya están ocupados o seleccionados
    const boletosValidos = boletosParaAgregar.filter(
        num => !boletosOcupados.has(num) && !boletosSeleccionados.includes(num)
    );
    setBoletosSeleccionados(prev => [...new Set([...prev, ...boletosValidos])]);
  }, [boletosOcupados, boletosSeleccionados]);

  // ==================================================================
  // FIN DE CAMBIOS
  // ==================================================================

  return {
    boletosOcupados,
    boletosSeleccionados,
    cargandoBoletos,
    toggleBoleto,
    seleccionarBoleto,
    limpiarSeleccion,
    agregarMultiplesBoletos,
    agregarBoletosEspecificos,
  };
};