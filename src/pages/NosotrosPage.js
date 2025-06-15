// src/pages/NosotrosPage.js

import React from 'react';

function NosotrosPage() {
  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Nuestra Historia
            </h2>
            <p className="mt-3 max-w-3xl text-lg text-gray-500">
              Bienvenido a Rifas App. Nacimos de la pasión por crear oportunidades emocionantes y transparentes para todos. Creemos que la suerte debe ser accesible y que cada participante merece una experiencia justa y clara.
            </p>
            <p className="mt-4 text-lg text-gray-500">
              Nuestro compromiso es utilizar la tecnología para simplificar el proceso de participación en rifas, garantizando que cada sorteo se realice con la máxima integridad, basándonos en los resultados oficiales de la Lotería Nacional.
            </p>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-0.5 md:grid-cols-3 lg:mt-0 lg:grid-cols-2">
            {/* Aquí puedes poner imágenes del equipo o relacionadas al negocio */}
            <div className="col-span-1 flex justify-center py-8 px-8 bg-gray-200 rounded-lg m-2">
              <img className="max-h-12" src="https://tailwindui.com/img/logos/statickit-logo-gray-400.svg" alt="Placeholder" />
            </div>
            <div className="col-span-1 flex justify-center py-8 px-8 bg-gray-200 rounded-lg m-2">
              <img className="max-h-12" src="https://tailwindui.com/img/logos/transistor-logo-gray-400.svg" alt="Placeholder" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NosotrosPage;