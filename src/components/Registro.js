// src/components/Registro.js

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

function Registro() {
  // ==================================================================
  // INICIO DE CAMBIOS: Dividimos el estado de nombre en dos
  // ==================================================================
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  // ==================================================================
  // FIN DE CAMBIOS
  // ==================================================================
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    const auth = getAuth();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userRef = doc(db, 'usuarios', user.uid);
      // ==================================================================
      // INICIO DE CAMBIOS: Guardamos el apellido en la base de datos
      // ==================================================================
      await setDoc(userRef, {
        nombre: nombre,
        apellidos: apellidos,
        telefono: telefono,
        email: email,
        rol: 'cliente',
      });
      // ==================================================================
      // FIN DE CAMBIOS
      // ==================================================================
      
      navigate('/perfil');

    } catch (err) {
      console.error("Error al registrar el usuario:", err.code);
      if (err.code === 'auth/email-already-in-use') {
        setError('Este correo electrónico ya está registrado.');
      } else {
        setError('Ocurrió un error al intentar crear la cuenta.');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800">Crea tu Cuenta</h2>
          <p className="mt-2 text-gray-600">Es rápido y fácil. ¡Únete a nuestras rifas!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ================================================================== */}
          {/* INICIO DE CAMBIOS: Dividimos el campo de nombre en dos */}
          {/* ================================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre(s)</label>
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Apellido</label>
              <input type="text" value={apellidos} onChange={(e) => setApellidos(e.target.value)} required className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
            </div>
          </div>
          {/* ================================================================== */}
          {/* FIN DE CAMBIOS */}
          {/* ================================================================== */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
            <input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} required className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
          </div>
          
          <button type="submit" className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            Crear Cuenta
          </button>
        </form>

        <div className="text-center">
            <p className="text-sm">¿Ya tienes una cuenta? <Link to="/login" className="font-medium text-blue-600 hover:underline">Inicia sesión aquí</Link></p>
        </div>

        {error && <p className="text-sm text-center text-red-600 pt-2">{error}</p>}
      </div>
    </div>
  );
}

export default Registro;