// src/pages/NosotrosPage.js

import React from 'react';

function NosotrosPage() {
  return (
    // REPARACIÓN: Se elimina text-text-light del div principal.
    <div className="bg-background-dark">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
          <div>
            {/* REPARACIÓN: Se elimina text-text-light. El título heredará el color principal del tema. */}
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              Nuestra Historia
            </h2>
            <p className="mt-3 max-w-3xl text-lg text-text-subtle">
              Bienvenido a Sorteos App. Nacimos de la pasión por crear oportunidades emocionantes y transparentes para todos. Creemos que la suerte debe ser accesible y que cada participante merece una experiencia justa y clara.
            </p>
            <p className="mt-4 text-lg text-text-subtle">
              Nuestro compromiso es utilizar la tecnología para simplificar el proceso de participación en sorteos, garantizando que cada uno se realice con la máxima integridad, basándonos en los resultados oficiales de la Lotería Nacional.
            </p>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="col-span-1 flex justify-center items-center bg-background-light border border-border-color rounded-lg h-32">
              <img className="max-h-24 object-contain" src="https://placehold.co/200x100/f3f4f6/6b7280?text=Equipo" alt="Nuestro Equipo" />
            </div>
            <div className="col-span-1 flex justify-center items-center bg-background-light border border-border-color rounded-lg h-32">
              <img className="max-h-24 object-contain" src="https://placehold.co/200x100/f3f4f6/6b7280?text=Valores" alt="Nuestros Valores" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NosotrosPage; 
