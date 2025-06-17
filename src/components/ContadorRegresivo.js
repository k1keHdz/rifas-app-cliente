// src/components/ContadorRegresivo.js

import React, { useState, useEffect } from 'react';

// Pequeño componente de ícono de reloj
const RelojIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

function ContadorRegresivo({ fechaExpiracion }) {
  const [tiempoRestante, setTiempoRestante] = useState(null);
  const [expirado, setExpirado] = useState(false);

  useEffect(() => {
    if (!fechaExpiracion) return;

    // ==================================================================
    // INICIO DE CORRECCIÓN: Declaramos 'intervalo' aquí
    // ==================================================================
    let intervalo;

    const calcularTiempo = () => {
      const ahora = new Date().getTime();
      const fechaLimite = fechaExpiracion.toDate().getTime();
      const diferencia = fechaLimite - ahora;

      if (diferencia <= 0) {
        setExpirado(true);
        setTiempoRestante(null);
        // Ahora 'intervalo' sí existe en este scope y podemos limpiarlo
        if (intervalo) clearInterval(intervalo); 
        return;
      }

      setExpirado(false);
      setTiempoRestante({
        dias: Math.floor(diferencia / (1000 * 60 * 60 * 24)),
        horas: Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutos: Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60)),
        segundos: Math.floor((diferencia % (1000 * 60)) / 1000),
      });
    };

    // Calculamos el tiempo una vez al inicio para que no haya un parpadeo
    calcularTiempo();

    // Asignamos el setInterval a nuestra variable ya declarada
    intervalo = setInterval(calcularTiempo, 1000);

    // La función de limpieza se ejecuta cuando el componente se desmonta
    return () => clearInterval(intervalo);
    // ==================================================================
    // FIN DE CORRECCIÓN
    // ==================================================================
  }, [fechaExpiracion]);

  if (expirado) {
    return (
      <div className="flex items-center text-sm font-semibold text-red-600 bg-red-100 px-3 py-1 rounded-full">
        <RelojIcon />
        Tiempo Expirado
      </div>
    );
  }

  // Mostramos un 'cargando' sutil mientras se calcula el primer valor
  if (!tiempoRestante) {
    return (
        <div className="flex items-center text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            <RelojIcon />
            Calculando...
        </div>
    );
  }

  return (
    <div className="flex items-center text-sm font-semibold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
      <RelojIcon />
      Expira en: {String(tiempoRestante.horas).padStart(2, '0')}:{String(tiempoRestante.minutos).padStart(2, '0')}:{String(tiempoRestante.segundos).padStart(2, '0')}
    </div>
  );
}

export default ContadorRegresivo;