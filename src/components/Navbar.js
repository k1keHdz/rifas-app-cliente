// src/components/Navbar.js

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; 
import { getAuth, signOut } from "firebase/auth";

function Navbar() {
  const { currentUser, userData } = useAuth(); 
  const navigate = useNavigate();

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  return (
    <nav className="bg-blue-600 text-white px-4 sm:px-6 py-3 flex justify-between items-center shadow-md">
      <Link to="/" className="text-xl font-bold hover:text-blue-200 transition-colors">
        Rifas App
      </Link>
      
      <div className="flex items-center space-x-4 sm:space-x-6 text-sm sm:text-base">
        <Link to="/rifas" className="hover:underline">
          Rifas públicas
        </Link>

        {currentUser ? (
          // === VISTA PARA USUARIOS LOGUEADOS ===
          <>
            {/* 'Mi Perfil' SÓLO se muestra si el rol NO es 'admin' */}
            {userData && userData.rol !== 'admin' && (
              <Link to="/perfil" className="hover:underline">
                Mi Perfil
              </Link>
            )}

            {/* El enlace a 'Admin' SÓLO se muestra si el rol es 'admin' */}
            {userData && userData.rol === 'admin' && (
              <Link to="/admin" className="font-semibold hover:underline">
                Admin
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold px-3 py-1 rounded-md text-sm transition-colors"
            >
              Cerrar Sesión
            </button>
          </>
        ) : (
          // === VISTA PARA VISITANTES (NO LOGUEADOS) ===
          <>
            <Link
              to="/login"
              className="hover:underline"
            >
              Iniciar Sesión
            </Link>
            <Link
              to="/registro"
              className="bg-white text-blue-600 font-semibold px-3 py-1 rounded-md text-sm hover:bg-gray-200 transition-colors"
            >
              Regístrate
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;