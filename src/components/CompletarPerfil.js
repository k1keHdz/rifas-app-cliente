// src/components/CompletarPerfil.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import Alerta from './Alerta';

function CompletarPerfil() {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [telefono, setTelefono] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userData) {
      if (userData.telefono) {
        navigate('/perfil');
      }
      setNombre(userData.nombre || currentUser?.displayName || '');
      setApellidos(userData.apellidos || '');
    }
  }, [userData, currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!telefono || !nombre) {
      setError("El nombre y el teléfono son obligatorios.");
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
      <div className="w-full max-w-md p-8 space-y-6 bg-background-light text-text-light border border-border-color rounded-xl shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold">¡Bienvenido! Un último paso...</h2>
          <p className="mt-2 text-text-subtle">Confirma tus datos y añade tu teléfono para poder participar en los sorteos.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-text-light">Nombre(s)</label>
                    <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required className="block w-full px-3 py-2 mt-1 bg-background-dark text-text-light border border-border-color rounded-md shadow-sm focus:outline-none focus:ring-accent-start focus:border-accent-start"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-light">Apellidos</label>
                    <input type="text" value={apellidos} onChange={(e) => setApellidos(e.target.value)} required className="block w-full px-3 py-2 mt-1 bg-background-dark text-text-light border border-border-color rounded-md shadow-sm focus:outline-none focus:ring-accent-start focus:border-accent-start"/>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-text-light">Teléfono (10 dígitos)</label>
                <input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} required placeholder="Ej. 5512345678" className="block w-full px-3 py-2 mt-1 bg-background-dark text-text-light border border-border-color rounded-md shadow-sm focus:outline-none focus:ring-accent-start focus:border-accent-start"/>
            </div>
          
            {error && <Alerta tipo="error" mensaje={error} />}

            <button type="submit" disabled={loading} className="w-full px-4 py-2 font-bold text-white bg-gradient-to-r from-accent-start to-accent-end rounded-lg hover:opacity-90 disabled:opacity-50">
                {loading ? "Guardando..." : "Guardar y Continuar"}
            </button>
        </form>
      </div>
    </div>
  );
}

export default CompletarPerfil;
