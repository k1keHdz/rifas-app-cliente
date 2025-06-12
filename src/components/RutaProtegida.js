// src/components/RutaProtegida.js

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// CAMBIO: El componente ahora acepta una prop opcional 'rolRequerido'
function RutaProtegida({ children, rolRequerido }) {
  // Obtenemos todos los datos del contexto
  const { currentUser, userData, cargandoAuth } = useAuth();

  // Si todavía estamos verificando la autenticación, mostramos un mensaje de carga
  if (cargandoAuth) {
    return <p className="text-center mt-20">Verificando acceso...</p>;
  }

  // Si NO hay ningún usuario logueado, siempre lo redirigimos a la página de login.
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Si la ruta SÍ requiere un rol específico (como 'admin')...
  if (rolRequerido) {
    // ...verificamos que el usuario tenga ese rol. Si no, lo mandamos al inicio.
    if (userData?.rol !== rolRequerido) {
      return <Navigate to="/" replace />;
    }
  }
  
  // Si pasó todas las verificaciones (está logueado y, si se requiere, tiene el rol correcto),
  // le damos acceso al contenido de la ruta.
  return children;
}

export default RutaProtegida;