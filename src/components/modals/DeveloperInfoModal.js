import React from 'react';
import { FaLaptopCode, FaRocket, FaWhatsapp, FaTimes } from 'react-icons/fa';

// Este es el número de WhatsApp al que los clientes potenciales te contactarán.
// ¡Recuerda cambiarlo por tu número personal o de negocios!
const TU_NUMERO_DE_WHATSAPP = '527773367064'; // Ejemplo: 521 seguido de tu número de 10 dígitos.

const DeveloperInfoModal = ({ onClose }) => {
    const mensajeWhatsApp = encodeURIComponent("Hola, visité un sitio desarrollado por ti y estoy interesado en tus servicios de desarrollo web. ¿Podrías darme más información?");
    const whatsappLink = `https://wa.me/${TU_NUMERO_DE_WHATSAPP}?text=${mensajeWhatsApp}`;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-background-light border border-border-color rounded-xl shadow-2xl p-6 sm:p-8 max-w-2xl w-full relative text-center"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 p-2 text-text-subtle hover:text-danger rounded-full transition-colors z-20"
                    aria-label="Cerrar modal"
                >
                    <FaTimes className="w-6 h-6" />
                </button>

                <div className="flex flex-col items-center">
                    <div className="bg-accent-primary/10 p-4 rounded-full mb-4">
                        <FaLaptopCode className="h-12 w-12 text-accent-primary" />
                    </div>

                    <h2 className="text-3xl font-bold text-text-primary mb-3">
                        ¿Necesitas una Solución Web a tu Medida?
                    </h2>
                    <p className="text-lg text-text-subtle mb-6 max-w-lg mx-auto">
                        Este sitio fue desarrollado con tecnología moderna para ofrecer una experiencia rápida, segura y confiable. Si buscas una solución similar o cualquier otro tipo de página web para tu negocio, estás en el lugar correcto.
                    </p>

                    <div className="w-full text-left space-y-4 mb-8">
                        <h3 className="text-xl font-semibold text-center text-text-primary">Mis Servicios Incluyen:</h3>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <li className="flex items-center p-3 bg-background-dark rounded-lg border border-border-color">
                                <FaRocket className="h-5 w-5 text-accent-primary mr-3 flex-shrink-0" />
                                <span>Sistemas de Sorteos Personalizados</span>
                            </li>
                            <li className="flex items-center p-3 bg-background-dark rounded-lg border border-border-color">
                                <FaRocket className="h-5 w-5 text-accent-primary mr-3 flex-shrink-0" />
                                <span>Páginas Web Corporativas y Landing Pages</span>
                            </li>
                             <li className="flex items-center p-3 bg-background-dark rounded-lg border border-border-color">
                                <FaRocket className="h-5 w-5 text-accent-primary mr-3 flex-shrink-0" />
                                <span>Tiendas en Línea (E-commerce)</span>
                            </li>
                            <li className="flex items-center p-3 bg-background-dark rounded-lg border border-border-color">
                                <FaRocket className="h-5 w-5 text-accent-primary mr-3 flex-shrink-0" />
                                <span>Integración con Pasarelas de Pago</span>
                            </li>
                        </ul>
                    </div>

                    <a 
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-8 py-3 bg-success text-white font-bold rounded-lg shadow-lg hover:bg-green-700 transition-transform transform hover:scale-105"
                    >
                        <FaWhatsapp className="h-6 w-6 mr-3" />
                        ¡Contáctame y hagamos crecer tu negocio!
                    </a>
                </div>
            </div>
        </div>
    );
};

export default DeveloperInfoModal;
