// src/components/Login.js

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import Alerta from './Alerta';

const GoogleLogo = () => ( <svg className="w-6 h-6 mr-3" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></svg>);

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const auth = getAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userRef = doc(db, 'usuarios', user.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists() && docSnap.data().rol === 'admin') {
        navigate('/admin');
      } else if (docSnap.exists() && !docSnap.data().telefono) {
        navigate('/completar-perfil');
      } else {
        navigate('/perfil');
      }
    } catch (err) {
      setError('El correo o la contraseña son incorrectos.');
      console.error("Error de login:", err.code);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setMessage('');
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userRef = doc(db, 'usuarios', user.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        if (!docSnap.data().telefono) {
          navigate('/completar-perfil');
        } else {
          navigate('/perfil');
        }
      } else {
        const nameParts = user.displayName ? user.displayName.split(' ') : ['Usuario'];
        const nombre = nameParts[0] || '';
        const apellidos = nameParts.slice(1).join(' ');
        
        await setDoc(userRef, {
          nombre: nombre,
          apellidos: apellidos,
          email: user.email,
          telefono: '',
          photoURL: user.photoURL || '',
          rol: 'cliente',
          fechaCreacion: serverTimestamp(),
        });
        navigate('/completar-perfil');
      }
    } catch (error) {
      console.error("Error en login con Google:", error);
      setError("No se pudo iniciar sesión con Google. Por favor, intenta de nuevo.");
    }
  };
  
  const handlePasswordReset = async () => {
    if (!email) {
      setError("Por favor, ingresa tu correo electrónico para restablecer la contraseña.");
      return;
    }
    setError('');
    setMessage('');
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("¡Hecho! Se ha enviado un enlace para restablecer tu contraseña a tu correo.");
    } catch (error) {
      setError("No se pudo enviar el correo. Verifica que la dirección sea correcta.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background-dark p-4">
      {/* REPARACIÓN: Se eliminan clases de color. Heredará los colores del tema. */}
      <div className="w-full max-w-md p-8 space-y-6 bg-background-light border border-border-color rounded-xl shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Accede a tu Cuenta</h2>
          <p className="mt-2 text-text-subtle">Para ver tus boletos y participar en nuevos sorteos.</p>
        </div>
        
        <div className="space-y-4">
          {/* REPARACIÓN: Se usan clases neutrales para el botón de Google. */}
          <button onClick={handleGoogleLogin} className="w-full flex items-center justify-center px-4 py-3 font-medium bg-white text-gray-700 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-light focus:ring-accent-primary transition-all duration-200">
            <GoogleLogo />
            Continuar con Google
          </button>
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border-color"></span></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-background-light px-2 text-text-subtle">o inicia con tu correo</span></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* REPARACIÓN: Se usa la clase .input-field para consistencia. */}
          <div><input placeholder="Correo Electrónico" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-field" /></div>
          <div><input placeholder="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="input-field" /></div>
          {/* REPARACIÓN: Se usa la clase .btn y .btn-primary para consistencia. */}
          <button type="submit" className="w-full btn btn-primary">Iniciar Sesión</button>
        </form>

        <div className="text-center text-sm">
          {/* REPARACIÓN: Se usa text-accent-primary para el enlace. */}
          <button onClick={handlePasswordReset} className="font-medium text-text-subtle hover:text-accent-primary hover:underline">
            ¿Olvidaste tu contraseña?
          </button>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-text-subtle">¿No tienes una cuenta? <Link to="/registro" className="font-medium text-accent-primary hover:underline">Regístrate aquí</Link></p>
        </div>

        {error && <Alerta mensaje={error} tipo="error" onClose={() => setError('')} />}
        {message && <Alerta mensaje={message} tipo="exito" onClose={() => setMessage('')} />}
      </div>
    </div>
  );
}

export default Login; 
