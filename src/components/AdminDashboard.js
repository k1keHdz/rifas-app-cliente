// src/components/AdminDashboard.js

import React from 'react';
import { Link } from 'react-router-dom';

// Íconos
const GestionarIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-blue-600"><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></svg> );
const HistorialIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-green-600"><path d="M3 3v18h18" /><path d="m18 9-5 5-4-4-3 3" /></svg> );
const GanadoresIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-yellow-500"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M5.58 11.25a2.5 2.5 0 0 1-2.45-2.5 2.5 2.5 0 0 1 2.5-2.5c1.28 0 2.45.98 2.5 2.25a2.5 2.5 0 0 1-2.5 2.5z"/><path d="M18.42 11.25a2.5 2.5 0 0 1-2.45-2.5 2.5 2.5 0 0 1 2.5-2.5c1.28 0 2.45.98 2.5 2.25a2.5 2.5 0 0 1-2.5 2.5z"/></svg>;


function AdminDashboard() {
  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800">Panel de Administración</h1>
          <p className="mt-2 text-lg text-gray-600">Selecciona una opción para gestionar tu sistema de sorteos.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <Link to="/admin/gestionar-rifas" className="block p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <GestionarIcon />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Gestionar Sorteos</h2>
            <p className="mt-2 text-gray-600">Crea, edita y revisa los detalles de todos tus sorteos.</p>
          </Link>

          <Link to="/admin/historial-ventas" className="block p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <HistorialIcon />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Historial de Ventas</h2>
            <p className="mt-2 text-gray-600">Consulta el historial detallado de ventas por cada sorteo.</p>
          </Link>

          <Link to="/admin/ganadores" className="block p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <GanadoresIcon />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Gestionar Ganadores</h2>
            <p className="mt-2 text-gray-600">Registra a los ganadores y gestiona la galería pública.</p>
          </Link>

        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
