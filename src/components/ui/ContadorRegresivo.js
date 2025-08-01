// src/components/ui/ContadorRegresivo.js

import React, { useState, useEffect } from 'react';

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

        let intervalo;

        const calcularTiempo = () => {
            const ahora = new Date().getTime();
            
            let fechaLimite;
            if (typeof fechaExpiracion.toDate === 'function') {
                fechaLimite = fechaExpiracion.toDate().getTime();
            } else {
                fechaLimite = new Date(fechaExpiracion).getTime();
            }

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
            <div className="flex items-center text-sm font-semibold text-danger bg-danger/10 px-3 py-1 rounded-full">
                <RelojIcon />
                Tiempo Expirado
            </div>
        );
    }

    if (!tiempoRestante) {
        return (
            <div className="flex items-center text-sm font-semibold text-text-subtle bg-background-light px-3 py-1 rounded-full">
                <RelojIcon />
                Calculando...
            </div>
        );
    }
    
    // ===== LÓGICA DE VISUALIZACIÓN CORREGIDA =====
    // Ahora, el componente decide qué formato mostrar basado en si quedan días.
    const renderTiempo = () => {
        const { dias, horas, minutos, segundos } = tiempoRestante;
        if (dias > 0) {
            // Si hay días, muestra un formato más completo.
            return `${dias}d ${String(horas).padStart(2, '0')}h ${String(minutos).padStart(2, '0')}m`;
        }
        // Si no hay días, muestra el formato de siempre.
        return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
    };

    return (
        <div className="flex items-center text-sm font-semibold text-warning bg-warning/10 px-3 py-1 rounded-full">
            <RelojIcon />
            Expira en: {renderTiempo()}
        </div>
    );
}

export default ContadorRegresivo;

