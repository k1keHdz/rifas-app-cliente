// src/components/Footer.js

import React from 'react';
import { Link } from 'react-router-dom';

// =================================================================================================
// INICIO DE LA MODIFICACIÓN: Importación desde 'react-icons' y estilo simple
// =================================================================================================
import { FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa';

// Componente para los iconos del footer (sin fondo, heredan color)
const FooterSocialIcon = ({ href, title, icon: Icon }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" title={title} className="text-gray-400 hover:text-white transition-colors duration-300">
        <span className="sr-only">{title}</span>
        <Icon className="h-6 w-6" />
    </a>
);
// =================================================================================================
// FIN DE LA MODIFICACIÓN
// =================================================================================================


function Footer() {
    // --- URLs de Redes Sociales (Reemplaza con tus enlaces reales) ---
    const socialLinks = {
        facebook: 'https://facebook.com/tu_pagina_real',
        instagram: 'https://instagram.com/tu_usuario_real',
        tiktok: 'https://tiktok.com/@tu_usuario_real'
    };

    return (
        <footer className="bg-background-dark">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                
                    <div className="col-span-2 md:col-span-1">
                        <img src="https://i.imgur.com/a9A1Jps.png" alt="Logo Sorteos App" className="h-12 w-auto mb-2"/>
                        <p className="mt-2 text-sm text-text-subtle">
                            Participa en nuestros sorteos y sé el próximo en ganar premios increíbles.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-text-subtle tracking-wider uppercase">Navegación</h3>
                        <ul className="mt-4 space-y-2">
                            <li><Link to="/" className="text-base hover:opacity-75">Inicio</Link></li>
                            <li><Link to="/ganadores" className="text-base hover:opacity-75">Ganadores</Link></li>
                            <li><Link to="/como-participar" className="text-base hover:opacity-75">Cómo Participar</Link></li>
                            <li><Link to="/verificador" className="text-base hover:opacity-75">Verificar Boleto</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-text-subtle tracking-wider uppercase">Soporte</h3>
                        <ul className="mt-4 space-y-2">
                            <li><Link to="/contacto" className="text-base hover:opacity-75">Contacto</Link></li>
                            <li><Link to="/nosotros" className="text-base hover:opacity-75">Nosotros</Link></li>
                            <li><Link to="/transparencia" className="text-base hover:opacity-75">Transparencia</Link></li>
                        </ul>
                    </div>
                    
                    <div>
                        <h3 className="text-sm font-semibold text-text-subtle tracking-wider uppercase">Síguenos</h3>
                        <div className="flex mt-4 space-x-6">
                            <FooterSocialIcon href={socialLinks.facebook} title="Facebook" icon={FaFacebook} />
                            <FooterSocialIcon href={socialLinks.instagram} title="Instagram" icon={FaInstagram} />
                            <FooterSocialIcon href={socialLinks.tiktok} title="TikTok" icon={FaTiktok} />
                        </div>
                    </div>

                </div>
                <div className="mt-8 border-t border-border-color pt-8 text-center">
                    <p className="text-base text-text-subtle">&copy; 2025 SorteosElPrimo. Todos los derechos reservados.</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
