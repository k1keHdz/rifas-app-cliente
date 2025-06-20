// src/components/RutaProtegida.js

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function RutaProtegida({ children, rolRequerido }) {
  const { currentUser, userData, cargandoAuth } = useAuth();

  // Si todavía estamos verificando la autenticación, mostramos un mensaje de carga.
  if (cargandoAuth) {
    // MEJORA: Se envuelve el mensaje en un div que ocupa toda la pantalla
    // con el color de fondo del tema, para una carga más suave.
    return (
        <div className="bg-background-dark min-h-screen flex items-center justify-center">
            <p className="text-center text-lg text-text-subtle">Verificando acceso...</p>
        </div>
    );
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
  
  // Si pasó todas las verificaciones, le damos acceso al contenido de la ruta.
  return children;
}

export default RutaProtegida;
