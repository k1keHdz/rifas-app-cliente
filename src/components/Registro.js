// src/components/Registro.js

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import Alerta from './Alerta';

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
      {/* REPARACIÓN: Se eliminan clases de color. Heredará los colores del tema. */}
      <div className="w-full max-w-md p-8 space-y-6 bg-background-light border border-border-color rounded-xl shadow-2xl">
        
        <div className="text-center">
          <h2 className="text-3xl font-bold">Crea tu Cuenta</h2>
          <p className="mt-2 text-text-subtle">Es rápido y fácil. ¡Únete a nuestros sorteos!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              {/* REPARACIÓN: Se elimina text-text-light. Heredará del body. */}
              <label className="block text-sm font-medium">Nombre(s)</label>
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required className="input-field mt-1"/>
            </div>
            <div>
              <label className="block text-sm font-medium">Apellido(s)</label>
              <input type="text" value={apellidos} onChange={(e) => setApellidos(e.target.value)} required className="input-field mt-1"/>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">Teléfono</label>
            <input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} required className="input-field mt-1"/>
          </div>
          <div>
            <label className="block text-sm font-medium">Correo Electrónico</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-field mt-1"/>
          </div>
          <div>
            <label className="block text-sm font-medium">Contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="input-field mt-1"/>
          </div>
          <div>
            <label className="block text-sm font-medium">Confirmar Contraseña</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="input-field mt-1"/>
          </div>
          
          {error && <Alerta mensaje={error} tipo="error" onClose={() => setError('')} />}

          {/* REPARACIÓN: Se usa la clase .btn y .btn-primary para consistencia. */}
          <button type="submit" className="w-full btn btn-primary">
            Crear Cuenta
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm text-text-subtle">¿Ya tienes una cuenta? <Link to="/login" className="font-medium text-accent-primary hover:underline">Inicia sesión aquí</Link></p>
        </div>

      </div>
    </div>
  );
}

export default Registro;
