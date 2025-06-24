// src/components/AdminDashboard.js

import React from 'react';
import { Link } from 'react-router-dom';
import AddAdminForm from './AddAdminForm';

// Íconos
const GestionarIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10"><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></svg> );
const HistorialIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10"><path d="M3 3v18h18" /><path d="m18 9-5 5-4-4-3 3" /></svg> );
const GanadoresIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M5.58 11.25a2.5 2.5 0 0 1-2.45-2.5 2.5 2.5 0 0 1 2.5-2.5c1.28 0 2.45.98 2.5 2.25a2.5 2.5 0 0 1-2.5 2.5z"/><path d="M18.42 11.25a2.5 2.5 0 0 1-2.45-2.5 2.5 2.5 0 0 1 2.5-2.5c1.28 0 2.45.98 2.5 2.25a2.5 2.5 0 0 1-2.5 2.5z"/></svg>;
const PerfilIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const ClientesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;

function AdminDashboard() {
    return (
        <div className="bg-background-dark min-h-screen p-4 sm:p-8">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold">Panel de Administración</h1>
                    <p className="mt-2 text-lg text-text-subtle">Selecciona una opción para gestionar tu sistema de sorteos.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    <Link to="/admin/gestionar-rifas" className="block p-8 bg-background-light rounded-xl shadow-lg hover:shadow-2xl hover:shadow-accent-primary/20 hover:-translate-y-1 transition-all duration-300 border border-border-color hover:border-accent-primary/50 text-accent-primary"> <GestionarIcon /> <h2 className="mt-4 text-2xl font-bold text-text-primary">Gestionar Sorteos</h2> <p className="mt-2 text-text-subtle">Crea, edita y revisa los detalles de todos tus sorteos.</p> </Link>
                    <Link to="/admin/historial-ventas" className="block p-8 bg-background-light rounded-xl shadow-lg hover:shadow-2xl hover:shadow-success/20 hover:-translate-y-1 transition-all duration-300 border border-border-color hover:border-success/50 text-success"> <HistorialIcon /> <h2 className="mt-4 text-2xl font-bold text-text-primary">Historial de Ventas</h2> <p className="mt-2 text-text-subtle">Consulta el historial detallado de ventas por cada sorteo.</p> </Link>
                    <Link to="/admin/ganadores" className="block p-8 bg-background-light rounded-xl shadow-lg hover:shadow-2xl hover:shadow-warning/20 hover:-translate-y-1 transition-all duration-300 border border-border-color hover:border-warning/50 text-warning"> <GanadoresIcon /> <h2 className="mt-4 text-2xl font-bold text-text-primary">Gestionar Ganadores</h2> <p className="mt-2 text-text-subtle">Registra a los ganadores y gestiona la galería pública.</p> </Link>
                    <Link to="/admin/clientes" className="block p-8 bg-background-light rounded-xl shadow-lg hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-1 transition-all duration-300 border border-border-color hover:border-purple-500/50 text-purple-500"> <ClientesIcon /> <h2 className="mt-4 text-2xl font-bold text-text-primary">Base de Datos de Clientes</h2> <p className="mt-2 text-text-subtle">Consulta y exporta la información de todos tus participantes.</p> </Link>
                    <Link to="/admin/configuracion" className="block p-8 bg-background-light rounded-xl shadow-lg hover:shadow-2xl hover:shadow-cyan-500/20 hover:-translate-y-1 transition-all duration-300 border border-border-color hover:border-cyan-500/50 text-cyan-500"> <SettingsIcon /> <h2 className="mt-4 text-2xl font-bold text-text-primary">Configuración</h2> <p className="mt-2 text-text-subtle">Activa, desactiva y ajusta las reglas y funcionalidades del sitio.</p> </Link>
                    <Link to="/perfil" className="block p-8 bg-background-light rounded-xl shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1 transition-all duration-300 border border-border-color hover:border-blue-500/50 text-blue-500"> <PerfilIcon /> <h2 className="mt-4 text-2xl font-bold text-text-primary">Mi Perfil</h2> <p className="mt-2 text-text-subtle">Edita tus datos personales y de seguridad.</p> </Link>
                </div>
                <div className="mt-12">
                   <AddAdminForm />
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
