// src/pages/TransparenciaPage.js

import React from 'react';

function TransparenciaPage() {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="bg-blue-700 rounded-lg shadow-xl overflow-hidden lg:grid lg:grid-cols-2 lg:gap-4">
          <div className="pt-10 pb-12 px-6 sm:pt-16 sm:px-16 lg:py-16 lg:pr-0 xl:py-20 xl:px-20">
            <div className="lg:self-center">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                <span className="block">Compromiso con la Transparencia</span>
              </h2>
              <p className="mt-4 text-lg leading-6 text-blue-200">
                Tu confianza es nuestra prioridad. Por eso, todos nuestros sorteos se basan en los resultados oficiales de la Lotería Nacional de México, una institución de confianza y reconocida públicamente.
              </p>
              <p className="mt-4 text-lg leading-6 text-blue-200">
                <strong>¿Cómo funciona?</strong> El número ganador de nuestros sorteos se determina por los últimos dígitos del premio mayor del sorteo de la Lotería Nacional especificado en la descripción de cada sorteo. Esto asegura un proceso 100% imparcial y auditable por cualquier participante.
              </p>
            </div>
          </div>
          <div className="-mt-6 aspect-w-5 aspect-h-3 md:aspect-w-2 md:aspect-h-1">
            {/* Puedes cambiar esta imagen por una de la Lotería Nacional o similar */}
            <img
              className="transform translate-x-6 translate-y-6 rounded-md object-cover object-left-top sm:translate-x-16 lg:translate-y-20"
              src="https://www.gob.mx/cms/uploads/article/main_image/89694/loteria.jpg"
              alt="Billete de Lotería Nacional"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransparenciaPage;
