// src/pages/TransparenciaPage.js

import React from 'react';
import { FaGavel, FaCheckCircle } from 'react-icons/fa';

function TransparenciaPage() {
    const sections = [
        {
            title: 'Rifas de 100 boletos (00-99):',
            description: 'Se utilizan las 2 últimas cifras del número ganador.',
        },
        {
            title: 'Rifas de 1,000 boletos (000-999):',
            description: 'Se utilizan las 3 últimas cifras del número ganador.',
        },
        {
            title: 'Rifas de 10,000 boletos (0000-9999):',
            description: 'Se utilizan las 4 últimas cifras del número ganador.',
        },
        {
            title: 'Rifas de 100,000 boletos (00000-99999):',
            description: 'Se utilizan las 5 cifras completas del número ganador.',
        },
    ];

    const linkClass = "font-bold text-accent-primary hover:underline";
    const trisUrl = "https://www.loterianacional.gob.mx/Tris/Resultados";
    const loteriaUrl = "https://www.loterianacional.gob.mx/";

    return (
        <div className="bg-background-dark min-h-screen py-12 sm:py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <FaGavel className="mx-auto h-12 w-12 text-accent-primary" />
                    <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
                        Transparencia y Legalidad de Nuestros Sorteos
                    </h1>
                    <p className="mt-6 max-w-2xl mx-auto text-xl text-text-subtle">
                        En Sorteos El Primo, la confianza y la claridad son nuestra máxima prioridad. Todos nuestros sorteos se basan en los resultados de los sorteos oficiales de la <a href={loteriaUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>Lotería Nacional</a>, específicamente de su popular sorteo <a href={trisUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>"Tris"</a>.
                    </p>
                </div>

                <div className="bg-background-light border border-border-color p-6 sm:p-8 rounded-2xl shadow-lg">
                    <h2 className="text-2xl font-bold text-center mb-6">¿Cómo determinamos al ganador?</h2>
                    <p className="text-lg text-text-subtle text-center mb-8">
                        El ganador de cada rifa se determina utilizando las últimas cifras del número ganador del sorteo <a href={trisUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>"Tris"</a> de la <a href={loteriaUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>Lotería Nacional</a>, en la fecha y hora estipuladas para la rifa.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {sections.map((section, index) => (
                            <div key={index} className="bg-background-dark border border-border-color p-5 rounded-lg">
                                <h3 className="font-semibold text-lg">{section.title}</h3>
                                <p className="text-text-subtle mt-1">{section.description}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-border-color">
                        <div className="flex items-center text-center">
                            <FaCheckCircle className="h-8 w-8 text-success flex-shrink-0 mr-4" />
                            <p className="text-md text-text-subtle">
                                Este método asegura que los resultados son 100% imparciales y verificables por cualquier persona en el sitio oficial de la <a href={loteriaUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>Lotería Nacional</a>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TransparenciaPage;
