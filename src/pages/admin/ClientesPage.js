// src/pages/admin/ClientesPage.js

import React, { useState, useEffect, useMemo } from 'react';
import { collectionGroup, query, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { FaFileCsv, FaSearch, FaUserFriends, FaSpinner } from 'react-icons/fa';

// Componente para una tarjeta de estadísticas
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

    useEffect(() => {
        const fetchClientes = async () => {
            setCargando(true);
            try {
                // =================================================================================================
                // INICIO DE LA CORRECIÓN: Se elimina el `orderBy` para evitar el error de índice.
                // La ordenación se hará en el cliente después de procesar los datos.
                // =================================================================================================
                const ventasQuery = query(collectionGroup(db, 'ventas'));
                // =================================================================================================
                // FIN DE LA CORRECIÓN
                // =================================================================================================
                const ventasSnapshot = await getDocs(ventasQuery);

                const clientesMap = new Map();

                ventasSnapshot.forEach(doc => {
                    const venta = doc.data();
                    const telefono = venta.comprador?.telefono; // Usar optional chaining por seguridad

                    if (!telefono) return; 

                    if (!clientesMap.has(telefono)) {
                        clientesMap.set(telefono, {
                            nombre: venta.comprador.nombre,
                            apellidos: venta.comprador.apellidos || '',
                            telefono: telefono,
                            email: venta.comprador.email || '',
                            fechaPrimerCompra: venta.fechaApartado?.toDate(),
                            totalBoletos: venta.cantidad || 0,
                        });
                    } else {
                        const clienteExistente = clientesMap.get(telefono);
                        clienteExistente.totalBoletos += venta.cantidad || 0;

                        // Actualizar fecha de primera compra si la nueva es más antigua
                        const nuevaFecha = venta.fechaApartado?.toDate();
                        if (nuevaFecha && nuevaFecha < clienteExistente.fechaPrimerCompra) {
                            clienteExistente.fechaPrimerCompra = nuevaFecha;
                        }

                        // Opcional: actualizar nombre y email al más reciente
                        clienteExistente.nombre = venta.comprador.nombre;
                        clienteExistente.apellidos = venta.comprador.apellidos || '';
                        clienteExistente.email = venta.comprador.email || '';
                    }
                });
                
                // Convertir el mapa a un array y ordenar por total de boletos
                const clientesArray = Array.from(clientesMap.values()).sort((a, b) => b.totalBoletos - a.totalBoletos);
                setClientes(clientesArray);

            } catch (error) {
                console.error("Error al obtener la base de datos de clientes:", error);
            } finally {
                setCargando(false);
            }
        };

        fetchClientes();
    }, []);

    // Memoizar los resultados filtrados para optimizar el rendimiento
    const clientesFiltrados = useMemo(() => {
        if (!searchTerm) return clientes;
        const lowercasedFilter = searchTerm.toLowerCase();
        return clientes.filter(cliente =>
            cliente.nombre.toLowerCase().includes(lowercasedFilter) ||
            (cliente.apellidos && cliente.apellidos.toLowerCase().includes(lowercasedFilter)) ||
            cliente.telefono.includes(lowercasedFilter)
        );
    }, [searchTerm, clientes]);

    const totalBoletosVendidos = useMemo(() => {
        return clientes.reduce((acc, cliente) => acc + cliente.totalBoletos, 0);
    }, [clientes]);
    
    // Función para exportar los datos a CSV
    const exportarCSV = () => {
        const headers = ["Nombre Completo", "Teléfono", "Email", "Fecha Primera Compra", "Total Boletos Comprados"];
        const rows = clientesFiltrados.map(cliente => [
            `"${cliente.nombre} ${cliente.apellidos}"`,
            `"${cliente.telefono}"`,
            `"${cliente.email}"`,
            `"${cliente.fechaPrimerCompra ? cliente.fechaPrimerCompra.toLocaleDateString('es-MX') : 'N/A'}"`,
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
                    <p className="text-text-subtle mt-1">Aquí puedes ver y gestionar la información de todos tus participantes.</p>
                </div>
                
                {/* Tarjetas de Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <StatCard title="Clientes Únicos" value={clientes.length} icon={<FaUserFriends size={22} />} />
                    <StatCard title="Total Boletos Vendidos" value={totalBoletosVendidos} icon={<FaFileCsv size={22} />} />
                </div>

                <div className="bg-background-light p-6 rounded-lg shadow-lg border border-border-color">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                        <div className="relative w-full sm:w-auto">
                            <FaSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-text-subtle" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre o teléfono..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input-field w-full pl-10"
                            />
                        </div>
                        <button
                            onClick={exportarCSV}
                            className="btn btn-primary w-full sm:w-auto flex items-center justify-center"
                            disabled={cargando || clientesFiltrados.length === 0}
                        >
                            <FaFileCsv className="mr-2" />
                            Exportar a CSV
                        </button>
                    </div>

                    {/* Contenedor de la tabla con scroll horizontal en móviles */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-text-subtle">
                            <thead className="text-xs uppercase bg-background-dark">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Nombre Completo</th>
                                    <th scope="col" className="px-6 py-3">Teléfono</th>
                                    <th scope="col" className="px-6 py-3">Email</th>
                                    <th scope="col" className="px-6 py-3">Primera Compra</th>
                                    <th scope="col" className="px-6 py-3 text-right">Total Boletos</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cargando ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-10">
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
                                            <td className="px-6 py-4">{cliente.fechaPrimerCompra ? cliente.fechaPrimerCompra.toLocaleDateString('es-MX') : 'N/A'}</td>
                                            <td className="px-6 py-4 text-right font-bold">{cliente.totalBoletos}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-10">No se encontraron clientes que hayan realizado compras.</td>
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
