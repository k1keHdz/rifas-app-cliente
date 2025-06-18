// src/components/Registro.js

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import Alerta from './Alerta'; // Importamos Alerta

function Registro() {
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
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
      
      await setDoc(userRef, {
        nombre: nombre,
        apellidos: apellidos,
        telefono: telefono,
        email: email,
        rol: 'cliente',
      });
      
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
    <div className="flex items-center justify-center min-h-screen bg-background-dark p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-background-light text-text-light border border-border-color rounded-xl shadow-2xl">
        
        <div className="text-center">
          <h2 className="text-3xl font-bold">Crea tu Cuenta</h2>
          <p className="mt-2 text-text-subtle">Es rápido y fácil. ¡Únete a nuestros sorteos!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-light">Nombre(s)</label>
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required className="block w-full px-3 py-2 mt-1 bg-background-dark text-text-light border border-border-color rounded-md shadow-sm focus:outline-none focus:ring-accent-start focus:border-accent-start"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-light">Apellido(s)</label>
              <input type="text" value={apellidos} onChange={(e) => setApellidos(e.target.value)} required className="block w-full px-3 py-2 mt-1 bg-background-dark text-text-light border border-border-color rounded-md shadow-sm focus:outline-none focus:ring-accent-start focus:border-accent-start"/>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-light">Teléfono</label>
            <input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} required className="block w-full px-3 py-2 mt-1 bg-background-dark text-text-light border border-border-color rounded-md shadow-sm focus:outline-none focus:ring-accent-start focus:border-accent-start"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-light">Correo Electrónico</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="block w-full px-3 py-2 mt-1 bg-background-dark text-text-light border border-border-color rounded-md shadow-sm focus:outline-none focus:ring-accent-start focus:border-accent-start"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-light">Contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="block w-full px-3 py-2 mt-1 bg-background-dark text-text-light border border-border-color rounded-md shadow-sm focus:outline-none focus:ring-accent-start focus:border-accent-start"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-light">Confirmar Contraseña</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="block w-full px-3 py-2 mt-1 bg-background-dark text-text-light border border-border-color rounded-md shadow-sm focus:outline-none focus:ring-accent-start focus:border-accent-start"/>
          </div>
          
          {error && <Alerta mensaje={error} tipo="error" onClose={() => setError('')} />}

          <button type="submit" className="w-full px-4 py-2 font-bold text-white bg-gradient-to-r from-accent-start to-accent-end rounded-lg hover:opacity-90">
            Crear Cuenta
          </button>
        </form>

        <div className="text-center">
            <p className="text-sm text-text-subtle">¿Ya tienes una cuenta? <Link to="/login" className="font-medium text-accent-start hover:underline">Inicia sesión aquí</Link></p>
        </div>

      </div>
    </div>
  );
}

export default Registro;
