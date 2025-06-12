// src/context/AuthContext.js

import React, { createContext, useState, useEffect, useContext } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
// AÑADIMOS las herramientas de Firestore para leer el perfil del usuario
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [cargandoAuth, setCargandoAuth] = useState(true);
  
  // NUEVO: Estado para guardar los datos del perfil del usuario desde Firestore (incluyendo el rol)
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        // Si hay un usuario logueado, vamos a Firestore a buscar su perfil
        const userRef = doc(db, 'usuarios', user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          // Si encontramos el documento, lo guardamos en nuestro nuevo estado
          setUserData({ id: docSnap.id, ...docSnap.data() });
        } else {
          // Esto puede pasar si un usuario se registra pero aún no ha completado su perfil
          setUserData(null);
        }
      } else {
        // Si el usuario cierra sesión, limpiamos ambos estados
        setUserData(null);
      }
      
      setCargandoAuth(false);
    });

    return unsubscribe;
  }, []);

  // La información que compartiremos con toda la app
  const value = {
    currentUser,
    userData, // AÑADIMOS los datos del perfil al contexto
    cargandoAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {!cargandoAuth && children}
    </AuthContext.Provider>
  );
};