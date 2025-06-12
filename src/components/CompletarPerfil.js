// src/components/CompletarPerfil.js

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

function CompletarPerfil() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Estados para los campos del formulario
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [error, setError] = useState('');

  // Efecto para pre-rellenar los datos que ya tenemos de Google/Firebase
  useEffect(() => {
    if (currentUser) {
      setNombre(currentUser.displayName || '');
    }
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!nombre || !telefono) {
      setError('El nombre y el teléfono son obligatorios.');
      return;
    }

    try {
      // Creamos la referencia al documento del usuario con su ID único
      const userRef = doc(db, 'usuarios', currentUser.uid);
      
      // Guardamos los datos en Firestore
      await setDoc(userRef, {
        nombre: nombre,
        telefono: telefono,
        email: currentUser.email, // El email lo tomamos del objeto de autenticación
      }, { merge: true }); // Usamos merge por si el documento ya existía

      // Redirigimos a la página principal una vez completado el perfil
      navigate('/');

    } catch (err) {
      console.error("Error al guardar el perfil:", err);
      setError('No se pudo guardar el perfil. Inténtalo de nuevo.');
    }
  };
  
  // Si por alguna razón no hay un usuario, no mostramos nada o un mensaje
  if (!currentUser) {
    return <p>Verificando usuario...</p>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800">Completa tu Perfil</h2>
        <p className="text-center text-sm text-gray-600">
          Necesitamos estos datos para contactarte si ganas y para tus futuras compras.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
            <input
              type="email"
              value={currentUser.email || ''}
              disabled // El email no se puede cambiar aquí
              className="block w-full px-3 py-2 mt-1 bg-gray-100 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Número de Teléfono</label>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              required
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          
          {error && <p className="text-sm text-center text-red-600">{error}</p>}

          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Guardar Perfil y Continuar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CompletarPerfil;