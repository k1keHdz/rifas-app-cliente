// src/hooks/useBoletos.js
import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

export const useBoletos = (rifaId) => {
  // CAMBIO: De Set a Map para guardar el estado de cada boleto (ej: 'comprado', 'apartado')
  const [boletosOcupados, setBoletosOcupados] = useState(new Map());
  const [boletosSeleccionados, setBoletosSeleccionados] = useState([]);
  const [cargandoBoletos, setCargandoBoletos] = useState(true);

  useEffect(() => {
    if (!rifaId) return;
    setCargandoBoletos(true);

    const ventasRef = collection(db, 'rifas', rifaId, 'ventas');
    // Consultamos solo las ventas que están 'comprado' o 'apartado'
    const q = query(ventasRef, where("estado", "in", ["comprado", "apartado"]));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // CAMBIO: De Set a Map
      const ocupados = new Map();
      snapshot.forEach((doc) => {
        const venta = doc.data();
        if (venta.numeros && venta.estado) {
          venta.numeros.forEach(num => {
            // CAMBIO: Guardamos el número como clave y su estado como valor
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
  
  // Las funciones de abajo no necesitan cambios, ya que .has() funciona tanto en Set como en Map
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

  const agregarMultiplesBoletos = useCallback((numerosNuevos) => {
      const boletosParaAgregar = Array.isArray(numerosNuevos) ? numerosNuevos : [];
      setBoletosSeleccionados(prev => [...new Set([...prev, ...boletosParaAgregar])]);
  }, []);

  return {
    boletosOcupados,
    boletosSeleccionados,
    cargandoBoletos,
    toggleBoleto,
    seleccionarBoleto,
    limpiarSeleccion,
    agregarMultiplesBoletos,
  };
};