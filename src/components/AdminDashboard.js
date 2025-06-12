// src/components/AdminDashboard.js

import React from 'react';
import { Link } from 'react-router-dom';

// Iconos SVG
const GestionarIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-blue-600"><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></svg> );
const PerfilIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-purple-600"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> );
const HistorialIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-green-600"><path d="M3 3v18h18" /><path d="m18 9-5 5-4-4-3 3" /></svg> );

function AdminDashboard() {
  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800">Panel de Administración</h1>
          <p className="mt-2 text-lg text-gray-600">Selecciona una opción para gestionar tu sistema de rifas.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          <Link to="/admin/gestionar-rifas" className="block p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <GestionarIcon />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Gestionar Rifas</h2>
            <p className="mt-2 text-gray-600">Crea, edita, activa y revisa los detalles de todas tus rifas.</p>
          </Link>

          <Link to="/perfil" className="block p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <PerfilIcon />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Mi Perfil</h2>
            <p className="mt-2 text-gray-600">Actualiza tu información de contacto y gestiona tu contraseña.</p>
          </Link>

          <Link to="/admin/historial-ventas" className="block p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <HistorialIcon />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Historial de Ventas</h2>
            <p className="mt-2 text-gray-600">Consulta el historial detallado de ventas por cada una de tus rifas.</p>
          </Link>

        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;