// src/components/Footer.js

import React from 'react';
import { Link } from 'react-router-dom';

// Íconos para redes sociales (puedes reemplazarlos por los que prefieras)
const FacebookIcon = () => <svg fill="currentColor" viewBox="0 0 24 24" className="h-6 w-6"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v7.028B18.343 21.128 22 16.991 22 12z"></path></svg>;
const InstagramIcon = () => <svg fill="currentColor" viewBox="0 0 24 24" className="h-6 w-6"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.012 3.584-.07 4.85c-.148 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.012-3.584.07-4.85C2.35 3.854 3.866 2.31 7.12 2.163 8.384 2.105 8.765 2.093 12 2.093m0-2.093c-3.264 0-3.678.014-4.963.072-4.148.188-6.082 2.111-6.27 6.27C.014 8.322 0 8.736 0 12s.014 3.678.072 4.963c.188 4.148 2.111 6.082 6.27 6.27 1.285.058 1.699.072 4.963.072s3.678-.014 4.963-.072c4.148-.188 6.082-2.111 6.27-6.27.058-1.285.072-1.699.072-4.963s-.014-3.678-.072-4.963c-.188-4.148-2.111-6.082-6.27-6.27C15.678.014 15.264 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"></path></svg>;

function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-lg font-bold">Rifas App</h3>
            <p className="mt-2 text-sm text-gray-400">
              Participa en nuestras rifas y sé el próximo en ganar premios increíbles.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Navegación</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/rifas" className="text-base text-gray-300 hover:text-white">Rifas Públicas</Link></li>
              <li><Link to="/ganadores" className="text-base text-gray-300 hover:text-white">Ganadores</Link></li>
              <li><Link to="/como-participar" className="text-base text-gray-300 hover:text-white">Cómo Participar</Link></li>
              <li><Link to="/verificador" className="text-base text-gray-300 hover:text-white">Verificar Boleto</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Soporte</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/contacto" className="text-base text-gray-300 hover:text-white">Contacto</Link></li>
              {/* Próximamente: Enlaces a 'Nosotros', 'Términos', etc. */}
            <li><Link to="/contacto" className="text-base text-gray-300 hover:text-white">Contacto</Link></li>
              <li><Link to="/nosotros" className="text-base text-gray-300 hover:text-white">Nosotros</Link></li>
              <li><Link to="/transparencia" className="text-base text-gray-300 hover:text-white">Transparencia</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Síguenos</h3>
            <div className="flex mt-4 space-x-6">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white"><span className="sr-only">Facebook</span><FacebookIcon /></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white"><span className="sr-only">Instagram</span><InstagramIcon /></a>
            </div>
          </div>

        </div>
        <div className="mt-8 border-t border-gray-700 pt-8 text-center">
          <p className="text-base text-gray-400">&copy; 2025 Rifas App. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;