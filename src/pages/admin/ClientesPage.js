// src/pages/admin/ClientesPage.js

import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { getFunctions, httpsCallable } from "firebase/functions";
import { db } from '../../firebase/firebaseConfig';
import { FaFileCsv, FaSearch, FaUserFriends, FaSpinner, FaSync } from 'react-icons/fa';

const StatCard = ({ title, value, icon }) => (
    <div className="bg-background-light p-4 rounded-lg shadow-md flex items-center border border-border-color">
        <div className="p-3 mr-4 text-accent-primary bg-accent-primary/10 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-text-subtle">{title}</p>
            <p className="text-2xl font-semibold">{value}</p>
        </div>
    </div>
);

function ClientesPage() {
    const [clientes, setClientes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [recalculando, setRecalculando] = useState(false);
    const [mensajeRecalculo, setMensajeRecalculo] = useState('');

    useEffect(() => {
        setCargando(true);
        const clientesRef = collection(db, 'clientes');
        const q = query(clientesRef, orderBy('ultimaActualizacion', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const clientesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setClientes(clientesData);
            setCargando(false);
        }, (error) => {
            console.error("Error al cargar la base de datos de clientes:", error);
            setCargando(false);
        });

        return () => unsubscribe();
    }, []);
    
    const handleRecalcular = async () => {
        if (!window.confirm("¿Estás seguro? Esto procesará todas las ventas existentes para construir o actualizar la base de datos de clientes. Es una operación intensiva que solo debe ejecutarse una vez o si notas inconsistencias.")) {
            return;
        }
        setRecalculando(true);
        setMensajeRecalculo('');
        try {
            const functions = getFunctions();
            const recalcular = httpsCallable(functions, 'recalcularClientes');
            const result = await recalcular();
            setMensajeRecalculo(result.data.message);
        } catch (error) {
            console.error("Error al recalcular clientes:", error);
            setMensajeRecalculo("Error: " + error.message);
        } finally {
            setRecalculando(false);
        }
    };

    const clientesFiltrados = useMemo(() => {
        if (!searchTerm) return clientes;
        const lowercasedFilter = searchTerm.toLowerCase();
        return clientes.filter(cliente =>
            cliente.nombre.toLowerCase().includes(lowercasedFilter) ||
            (cliente.apellidos && cliente.apellidos.toLowerCase().includes(lowercasedFilter)) ||
            cliente.telefono.includes(lowercasedFilter) ||
            (cliente.estado && cliente.estado.toLowerCase().includes(lowercasedFilter))
        );
    }, [searchTerm, clientes]);

    const totalBoletosVendidos = useMemo(() => {
        return clientes.reduce((acc, cliente) => acc + (cliente.totalBoletos || 0), 0);
    }, [clientes]);
    
    const exportarCSV = () => {
        const headers = ["Nombre Completo", "Teléfono", "Email", "Estado", "Fecha Primera Compra", "Total Boletos Comprados"];
        const rows = clientesFiltrados.map(cliente => [
            `"${cliente.nombre} ${cliente.apellidos || ''}"`,
            `"${cliente.telefono}"`,
            `"${cliente.email || 'N/A'}"`,
            `"${cliente.estado || 'N/A'}"`,
            `"${cliente.fechaPrimeraCompra ? new Date(cliente.fechaPrimeraCompra.seconds * 1000).toLocaleDateString('es-MX') : 'N/A'}"`,
            cliente.totalBoletos
        ].join(','));

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "base_de_datos_clientes.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-background-dark min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Base de Datos de Clientes</h1>
                    <p className="text-text-subtle mt-1">Esta lista se actualiza automáticamente con cada nueva venta.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <StatCard title="Clientes Únicos" value={clientes.length} icon={<FaUserFriends size={22} />} />
                    <StatCard title="Total Boletos Comprados" value={totalBoletosVendidos} icon={<FaFileCsv size={22} />} />
                </div>

                <div className="bg-background-light p-6 rounded-lg shadow-lg border border-border-color">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                        <div className="relative w-full sm:max-w-xs">
                            <FaSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-text-subtle" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, teléfono..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input-field w-full pl-10"
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                           <button
                                onClick={handleRecalcular}
                                className="btn btn-secondary flex-1 sm:flex-initial flex items-center justify-center"
                                disabled={recalculando}
                            >
                                <FaSync className={`mr-2 ${recalculando ? 'animate-spin' : ''}`} />
                                {recalculando ? "Procesando..." : "Recalcular BD"}
                            </button>
                            <button
                                onClick={exportarCSV}
                                className="btn btn-primary flex-1 sm:flex-initial flex items-center justify-center"
                                disabled={cargando || clientesFiltrados.length === 0}
                            >
                                <FaFileCsv className="mr-2" />
                                Exportar a CSV
                            </button>
                        </div>
                    </div>
                    {mensajeRecalculo && <p className="text-center text-sm my-2 p-2 bg-background-dark rounded-md">{mensajeRecalculo}</p>}
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-text-subtle">
                            <thead className="text-xs uppercase bg-background-dark">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Nombre Completo</th>
                                    <th scope="col" className="px-6 py-3">Teléfono</th>
                                    <th scope="col" className="px-6 py-3">Email</th>
                                    <th scope="col" className="px-6 py-3">Estado</th>
                                    <th scope="col" className="px-6 py-3">Primera Compra</th>
                                    <th scope="col" className="px-6 py-3 text-right">Total Boletos</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cargando ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-10">
                                            <div className="flex justify-center items-center">
                                                <FaSpinner className="animate-spin mr-3 h-5 w-5" />
                                                Cargando clientes...
                                            </div>
                                        </td>
                                    </tr>
                                ) : clientesFiltrados.length > 0 ? (
                                    clientesFiltrados.map(cliente => (
                                        <tr key={cliente.telefono} className="bg-background-light border-b border-border-color hover:bg-background-dark">
                                            <th scope="row" className="px-6 py-4 font-medium text-text-primary whitespace-nowrap">
                                                {cliente.nombre} {cliente.apellidos}
                                            </th>
                                            <td className="px-6 py-4">{cliente.telefono}</td>
                                            <td className="px-6 py-4">{cliente.email || 'N/A'}</td>
                                            <td className="px-6 py-4">{cliente.estado || 'N/A'}</td>
                                            <td className="px-6 py-4">{cliente.fechaPrimeraCompra ? new Date(cliente.fechaPrimeraCompra.seconds * 1000).toLocaleDateString('es-MX') : 'N/A'}</td>
                                            <td className="px-6 py-4 text-right font-bold">{cliente.totalBoletos}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-10">No se encontraron clientes. Puedes usar el botón "Recalcular BD" para poblar los datos por primera vez.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ClientesPage;
