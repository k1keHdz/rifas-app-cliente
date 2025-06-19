// src/components/Footer.js

import React from 'react';
import { Link } from 'react-router-dom';

// --- Íconos Sociales ---
// REPARACIÓN: Se eliminan las clases de color del componente. Ahora los iconos heredarán el color del texto.
const SocialIcon = ({ href, title, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" title={title} className="hover:opacity-75 transition-opacity">
        <span className="sr-only">{title}</span>
        {children}
    </a>
);

const FacebookIcon = () => <svg fill="currentColor" viewBox="0 0 24 24" className="h-6 w-6"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v7.028B18.343 21.128 22 16.991 22 12z"></path></svg>;
const InstagramIcon = () => <svg fill="currentColor" viewBox="0 0 24 24" className="h-6 w-6"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.012 3.584-.07 4.85c-.148 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.012-3.584.07-4.85C2.35 3.854 3.866 2.31 7.12 2.163 8.384 2.105 8.765 2.093 12 2.093m0-2.093c-3.264 0-3.678.014-4.963.072-4.148.188-6.082 2.111-6.27 6.27C.014 8.322 0 8.736 0 12s.014 3.678.072 4.963c.188 4.148 2.111 6.082 6.27 6.27 1.285.058 1.699.072 4.963.072s3.678-.014 4.963-.072c4.148-.188 6.082-2.111 6.27-6.27.058-1.285.072-1.699.072-4.963s-.014-3.678-.072-4.963c-.188-4.148-2.111-6.082-6.27-6.27C15.678.014 15.264 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"></path></svg>;
const TikTokIcon = () => <svg fill="currentColor" viewBox="0 0 24 24" className="h-6 w-6"><path d="M12.525.02c1.31-.02 2.61-.01 3.91.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-1.06-.63-1.9-1.48-2.5-2.5-.42-.71-.65-1.49-.75-2.28-.03-.25-.01-.5-.01-.76.01-2.92-.01-5.84.02-8.76.13-1.43.79-2.85 1.74-3.95 1.28-1.46 3.25-2.31 5.23-2.35 1.65-.03 3.3.39 4.67 1.33v-2.9c-.01-1.22-.52-2.42-1.34-3.34-.79-.88-1.82-1.38-2.89-1.48-.03-.01-.07-.02-.1-.02z"/></svg>;


function Footer() {
    // --- URLs de Redes Sociales (Reemplaza con tus enlaces reales) ---
    const socialLinks = {
        facebook: 'https://facebook.com/tu_pagina_real',
        instagram: 'https://instagram.com/tu_usuario_real',
        tiktok: 'https://tiktok.com/@tu_usuario_real'
    };

    // REPARACIÓN: Se elimina la clase `text-text-light` del footer. Ahora el color del texto será heredado del `body`.
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
                        {/* REPARACIÓN: Se elimina `text-gray-400`. El título del widget ahora usará el color de texto secundario definido en el tema (`text-text-subtle`). */}
                        <h3 className="text-sm font-semibold text-text-subtle tracking-wider uppercase">Navegación</h3>
                        <ul className="mt-4 space-y-2">
                            {/* REPARACIÓN: Se eliminan las clases de color de los links. Ahora heredan el color principal y tienen un hover sutil. */}
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
                            <SocialIcon href={socialLinks.facebook} title="Facebook"><FacebookIcon /></SocialIcon>
                            <SocialIcon href={socialLinks.instagram} title="Instagram"><InstagramIcon /></SocialIcon>
                            <SocialIcon href={socialLinks.tiktok} title="TikTok"><TikTokIcon /></SocialIcon>
                        </div>
                    </div>

                </div>
                <div className="mt-8 border-t border-border-color pt-8 text-center">
                    <p className="text-base text-text-subtle">&copy; 2025 Sorteos App. Todos los derechos reservados.</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
