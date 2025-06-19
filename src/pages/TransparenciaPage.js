// src/pages/TransparenciaPage.js

import React from 'react';

function TransparenciaPage() {
  return (
    <div className="bg-background-dark py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-background-light border border-border-color rounded-lg shadow-xl overflow-hidden lg:grid lg:grid-cols-2 lg:gap-4">
          <div className="pt-10 pb-12 px-6 sm:pt-16 sm:px-16 lg:py-16 lg:pr-0 xl:py-20 xl:px-20">
            <div className="lg:self-center">
              {/* REPARACIÓN: Se elimina text-text-light. */}
              <h2 className="text-3xl font-extrabold sm:text-4xl">
                <span className="block">Compromiso con la Transparencia</span>
              </h2>
              <p className="mt-4 text-lg leading-6 text-text-subtle">
                Tu confianza es nuestra prioridad. Por eso, todos nuestros sorteos se basan en los resultados oficiales de la Lotería Nacional de México, una institución de confianza y reconocida públicamente.
              </p>
              <p className="mt-4 text-lg leading-6 text-text-subtle">
                <strong>¿Cómo funciona?</strong> El número ganador de nuestros sorteos se determina por los últimos dígitos del premio mayor del sorteo de la Lotería Nacional especificado en la descripción de cada sorteo. Esto asegura un proceso 100% imparcial y auditable por cualquier participante.
              </p>
            </div>
          </div>
          <div className="self-center p-4">
            <img
              className="rounded-md object-contain w-full"
              src="https://www.loterianacional.gob.mx/images/logo-institucional.png"
              alt="Logo de la Lotería Nacional"
              onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/600x400/f9fafb/6b7280?text=Lotería+Nacional'; }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransparenciaPage;
