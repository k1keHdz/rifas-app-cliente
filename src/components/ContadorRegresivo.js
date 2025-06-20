// src/components/ContadorRegresivo.js

import React, { useState, useEffect } from 'react';

// Pequeño componente de ícono de reloj
const RelojIcon = () => (
  // REPARACIÓN: Se elimina la clase de color. Heredará el color del texto del padre.
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

    let intervalo;

    const calcularTiempo = () => {
      const ahora = new Date().getTime();
      const fechaLimite = fechaExpiracion.toDate().getTime();
      const diferencia = fechaLimite - ahora;

      if (diferencia <= 0) {
        setExpirado(true);
        setTiempoRestante(null);
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

    calcularTiempo();
    intervalo = setInterval(calcularTiempo, 1000);

    return () => clearInterval(intervalo);
  }, [fechaExpiracion]);

  if (expirado) {
    return (
      // REPARACIÓN: Se usan las clases semánticas del tema para el estado de error/expirado.
      <div className="flex items-center text-sm font-semibold text-danger bg-danger/10 px-3 py-1 rounded-full">
        <RelojIcon />
        Tiempo Expirado
      </div>
    );
  }

  if (!tiempoRestante) {
    return (
        // REPARACIÓN: Se usan clases neutrales para el estado de carga.
        <div className="flex items-center text-sm font-semibold text-text-subtle bg-background-light px-3 py-1 rounded-full">
            <RelojIcon />
            Calculando...
        </div>
    );
  }

  return (
    // REPARACIÓN: Se usan las clases semánticas del tema para el estado de advertencia/activo.
    <div className="flex items-center text-sm font-semibold text-warning bg-warning/10 px-3 py-1 rounded-full">
      <RelojIcon />
      Expira en: {String(tiempoRestante.horas).padStart(2, '0')}:{String(tiempoRestante.minutos).padStart(2, '0')}:{String(tiempoRestante.segundos).padStart(2, '0')}
    </div>
  );
}

export default ContadorRegresivo;
