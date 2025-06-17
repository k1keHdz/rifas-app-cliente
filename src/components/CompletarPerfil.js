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
    // Si los datos del usuario ya están cargados y tiene teléfono, lo redirigimos.
    if (userData) {
      if (userData.telefono) {
        navigate('/perfil');
      }
      // Pre-llenamos el formulario con los datos existentes (ej. nombre de Google).
      setNombre(userData.nombre || currentUser?.displayName || '');
      setApellidos(userData.apellidos || '');
    }
  }, [userData, currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!telefono || !nombre) { // Apellidos puede ser opcional si lo decides
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

      // --- INICIO DE LA CORRECCIÓN ---
      // Creamos un objeto con todos los datos a actualizar.
      // Esto previene que se borren campos existentes como photoURL o rol.
      const updatedData = {
        nombre,
        apellidos,
        telefono,
        // ¡Clave! Nos aseguramos de conservar la photoURL si existe.
        photoURL: currentUser.photoURL || userData.photoURL || ''
      };

      // Actualizamos el documento con el objeto completo.
      await updateDoc(userRef, updatedData);
      // --- FIN DE LA CORRECCIÓN ---

      // El listener de AuthContext se encargará de actualizar el estado global.
      navigate('/perfil'); 

    } catch (err) {
      console.error("Error al completar el perfil:", err);
      setError("No se pudo guardar la información. Inténtalo de nuevo.");
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">¡Bienvenido! Un último paso...</h2>
          <p className="mt-2 text-gray-600">Confirma tus datos y añade tu teléfono para poder participar en las rifas.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre(s)</label>
                    <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required className="block w-full px-3 py-2 mt-1 border rounded-md"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Apellidos</label>
                    <input type="text" value={apellidos} onChange={(e) => setApellidos(e.target.value)} required className="block w-full px-3 py-2 mt-1 border rounded-md"/>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Teléfono (10 dígitos)</label>
                <input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} required placeholder="Ej. 5512345678" className="block w-full px-3 py-2 mt-1 border rounded-md"/>
            </div>
          
            {error && <Alerta tipo="error" mensaje={error} />}

            <button type="submit" disabled={loading} className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                {loading ? "Guardando..." : "Guardar y Continuar"}
            </button>
        </form>
      </div>
    </div>
  );
}

export default CompletarPerfil;
