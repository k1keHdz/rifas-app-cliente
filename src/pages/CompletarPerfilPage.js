// src/pages/CompletarPerfilPage.js

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
// CORREGIDO: Ruta actualizada para la configuración de Firebase
import { db } from '../config/firebaseConfig';
// CORREGIDO: Ruta actualizada para el componente Alerta
import Alerta from '../components/ui/Alerta';

// CORREGIDO: Renombrado el componente para que coincida con el nombre del archivo
function CompletarPerfilPage() {
    const { currentUser, userData } = useAuth();
    const navigate = useNavigate();
    
    const [nombre, setNombre] = useState('');
    const [apellidos, setApellidos] = useState('');
    const [telefono, setTelefono] = useState('');
    const [estado, setEstado] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (userData) {
            if (userData.telefono && userData.estado) {
                navigate('/perfil');
            }
            setNombre(userData.nombre || currentUser?.displayName || '');
            setApellidos(userData.apellidos || '');
            setEstado(userData.estado || '');
        }
    }, [userData, currentUser, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!telefono || !nombre || !estado) {
            setError("El nombre, estado y teléfono son obligatorios.");
            return;
        }
        if (!/^\d{10}$/.test(telefono)) {
            setError("El número de teléfono debe tener 10 dígitos.");
            return;
        }
        setLoading(true);
        setError('');

        try {
            const userRef = doc(db, 'usuarios', currentUser.uid);
            const updatedData = {
                nombre,
                apellidos,
                telefono,
                estado,
                photoURL: currentUser.photoURL || userData.photoURL || ''
            };
            await updateDoc(userRef, updatedData);
            navigate('/perfil'); 
        } catch (err) {
            console.error("Error al completar el perfil:", err);
            setError("No se pudo guardar la información. Inténtalo de nuevo.");
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background-dark p-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-background-light border border-border-color rounded-xl shadow-2xl">
                <div className="text-center">
                    <h2 className="text-3xl font-bold">¡Bienvenido! Un último paso...</h2>
                    <p className="mt-2 text-text-subtle">Confirma tus datos y añade tu teléfono para poder participar en los sorteos.</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Nombre(s)</label>
                            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required className="input-field mt-1"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Apellidos</label>
                            <input type="text" value={apellidos} onChange={(e) => setApellidos(e.target.value)} required className="input-field mt-1"/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Teléfono (10 dígitos)</label>
                        <input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} required placeholder="Ej. 5512345678" className="input-field mt-1"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Estado de Residencia</label>
                        <input type="text" value={estado} onChange={(e) => setEstado(e.target.value)} required placeholder="Ej. Jalisco" className="input-field mt-1"/>
                    </div>
                    
                    {error && <Alerta tipo="error" mensaje={error} />}

                    <button type="submit" disabled={loading} className="w-full btn btn-primary disabled:opacity-50">
                        {loading ? "Guardando..." : "Guardar y Continuar"}
                    </button>
                </form>
            </div>
        </div>
    );
}

// CORREGIDO: Exportamos el componente con el nuevo nombre
export default CompletarPerfilPage;
