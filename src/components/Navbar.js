// src/components/Navbar.js

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAuth, signOut } from "firebase/auth";
import Avatar from "./Avatar";

// --- Iconos SVG para la UI ---
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-1.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;


function Navbar() {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const displayName = userData?.nombre || currentUser?.email?.split('@')[0] || 'Usuario';

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      setIsMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-blue-600 text-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link to="/" onClick={handleLinkClick} className="text-xl font-bold hover:text-blue-200 transition-colors">
              Sorteos App
            </Link>
          </div>

          {/* Menú de Escritorio */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/como-participar" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">Cómo participar</Link>
            <Link to="/ganadores" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">Ganadores</Link>
            <Link to="/transparencia" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">Transparencia</Link>
            <Link to="/nosotros" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">Nosotros</Link>
            <Link to="/verificador" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">Verificar Boleto</Link>
            <Link to="/contacto" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">Contacto</Link>
            
            {currentUser && userData?.rol === 'admin' && (
              <Link to="/admin" className="px-3 py-2 rounded-md text-sm font-bold hover:bg-blue-700">Admin</Link>
            )}
            
            {/* --- SECCIÓN DE USUARIO (ESCRITORIO) --- */}
            <div className="flex items-center space-x-4 ml-4">
              {currentUser ? (
                <div className="flex items-center space-x-4">
                  {/* 1. Avatar del Usuario */}
                  {userData?.rol !== 'admin' && (
                    <Link to="/perfil" title="Mi Perfil">
                      <Avatar
                        className="h-9 w-9 rounded-full object-cover border-2 border-transparent hover:border-blue-300 text-lg"
                        photoURL={currentUser.photoURL}
                        name={displayName}
                      />
                    </Link>
                  )}
                  {/* 2. Botón de Cerrar Sesión (sutil) */}
                  <button 
                    onClick={handleLogout} 
                    className="flex items-center text-blue-200 hover:text-white hover:bg-blue-700 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                    title="Cerrar Sesión"
                  >
                    <LogoutIcon/>
                  </button>
                </div>
              ) : (
                <>
                  <Link to="/login" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">Iniciar Sesión</Link>
                  <Link to="/registro" className="bg-white text-blue-600 font-semibold px-3 py-1 rounded-md text-sm hover:bg-gray-200 transition-colors">Regístrate</Link>
                </>
              )}
            </div>
          </div>

          {/* Botón de Menú Móvil */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-700 focus:outline-none">
              {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* Panel de Menú Móvil */}
      {isMenuOpen && (
        <div className="md:hidden bg-blue-700">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/como-participar" onClick={handleLinkClick} className="text-gray-200 hover:bg-blue-800 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Cómo participar</Link>
            <Link to="/ganadores" onClick={handleLinkClick} className="text-gray-200 hover:bg-blue-800 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Ganadores</Link>
            <Link to="/verificador" onClick={handleLinkClick} className="text-gray-200 hover:bg-blue-800 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Verificar Boleto</Link>
            <Link to="/transparencia" onClick={handleLinkClick} className="text-gray-200 hover:bg-blue-800 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Transparencia</Link>
            <Link to="/nosotros" onClick={handleLinkClick} className="text-gray-200 hover:bg-blue-800 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Nosotros</Link>
            <Link to="/contacto" onClick={handleLinkClick} className="text-gray-200 hover:bg-blue-800 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Contacto</Link>
            {currentUser && userData?.rol === 'admin' && (
              <Link to="/admin" onClick={handleLinkClick} className="text-gray-200 hover:bg-blue-800 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Admin</Link>
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-blue-800">
            {currentUser ? (
              <div>
                {/* --- SECCIÓN DE USUARIO (MÓVIL) --- */}
                <div className="flex items-center justify-between px-5 mb-3">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                       <Avatar
                          className="h-10 w-10 rounded-full object-cover text-xl"
                          photoURL={currentUser.photoURL}
                          name={displayName}
                        />
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium leading-none text-white">{userData?.nombre || 'Bienvenido'}</div>
                      <div className="text-sm font-medium leading-none text-gray-300 mt-1">{currentUser.email}</div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 px-2 space-y-1">
                  {userData && userData.rol !== 'admin' && (
                    <Link to="/perfil" onClick={handleLinkClick} className="block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:text-white hover:bg-blue-800">Mi Perfil</Link>
                  )}
                  <button onClick={handleLogout} className="w-full text-left flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:text-white hover:bg-blue-800">
                    <LogoutIcon />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-2 space-y-1">
                <Link to="/login" onClick={handleLinkClick} className="block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:text-white hover:bg-blue-800">Iniciar Sesión</Link>
                <Link to="/registro" onClick={handleLinkClick} className="block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:text-white hover:bg-blue-800">Regístrate</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
