import React from 'react';
import { FaGavel, FaCheckCircle, FaQuestionCircle, FaTrophy } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function TransparenciaPage() {
    const sections = [
        {
            title: 'Sorteos de 100 boletos (00-99):',
            description: 'Se utilizan las 2 últimas cifras del número ganador.',
        },
        {
            title: 'Sorteos de 1,000 boletos (000-999):',
            description: 'Se utilizan las 3 últimas cifras del número ganador.',
        },
        {
            title: 'Sorteos de 10,000 boletos (0000-9999):',
            description: 'Se utilizan las 4 últimas cifras del número ganador.',
        },
        {
            title: 'Sorteos de 100,000 boletos (00000-99999):',
            description: 'Se utilizan las 5 cifras completas del número ganador.',
        },
    ];

    // ===== SECCIÓN DE PREGUNTAS FRECUENTES ACTUALIZADA =====
    const faqs = [
        {
            question: '¿Qué pasa si el número premiado no se vendió? Nuestro Compromiso: ¡Siempre hay un ganador!',
            answer: 'Nuestra regla de oro es que cada premio tiene que ser entregado. Si el resultado de la Lotería Nacional (tris) corresponde a un boleto que no fue pagado, el sorteo no se anula. En su lugar, tomaremos el resultado del siguiente sorteo hábil de la Lotería Nacional (misma modalidad y horario) y repetiremos este proceso hasta que el número coincida con un participante que haya completado su pago. Esto lo anunciaremos antes en nuestras Redes Sociales. Esta política asegura total justicia y que la suerte siempre encuentre a su dueño.',
            icon: FaQuestionCircle,
        },
        {
            question: '¿Cómo puedo verificar los ganadores anteriores?',
            answer: 'La confianza se demuestra con hechos. Mantenemos un registro público y transparente de todos nuestros ganadores. Puedes ver la galería completa, con fotos y testimonios, en nuestra sección oficial de "Ganadores". Además, siempre anunciamos los resultados en nuestras redes sociales para celebrar junto a toda nuestra comunidad.',
            icon: FaTrophy,
        }
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

                <div className="bg-background-light border border-border-color p-6 sm:p-8 rounded-2xl shadow-lg mb-12">
                    <h2 className="text-2xl font-bold text-center mb-6">¿Cómo determinamos al ganador?</h2>
                    <p className="text-lg text-text-subtle text-center mb-8">
                        El ganador de cada sorteo se determina utilizando las últimas cifras del número ganador del sorteo <a href={trisUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>"Tris"</a> de la <a href={loteriaUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>Lotería Nacional</a>, en la fecha y hora estipuladas para el sorteo.
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

                <div className="bg-background-light border border-border-color p-6 sm:p-8 rounded-2xl shadow-lg">
                    <h2 className="text-2xl font-bold text-center mb-8">Preguntas Frecuentes</h2>
                    <div className="space-y-8">
                        {faqs.map((faq, index) => (
                            <div key={index} className="flex items-start">
                                <faq.icon className="h-8 w-8 text-accent-primary flex-shrink-0 mr-5 mt-1" />
                                <div>
                                    <h3 className="text-lg font-bold text-text-primary">{faq.question}</h3>
                                    <p className="mt-2 text-text-subtle">{faq.answer}
                                        {/* Mantenemos el enlace dinámico a la página de ganadores */}
                                        {faq.question.includes('verificar') && (
                                             <Link to="/ganadores" className={`ml-2 ${linkClass}`}>¡Visita la galería aquí!</Link>
                                        )}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TransparenciaPage;
