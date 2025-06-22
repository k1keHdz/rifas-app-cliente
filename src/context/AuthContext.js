// src/context/AuthContext.js
import React, { useState, useEffect, useContext } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore'; // Ya no necesitamos setDoc ni serverTimestamp aquí
import { db } from '../firebase/firebaseConfig';

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [cargandoAuth, setLoading] = useState(true); // Renombrado para más claridad

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);

      if (user) {
        // Si hay un usuario, escuchamos su documento en Firestore.
        const userRef = doc(db, 'usuarios', user.uid);
        const unsubscribeFirestore = onSnapshot(userRef, (docSnap) => {
          
          // ===============================================================================================
          // INICIO DE LA MODIFICACIÓN: Se elimina el bloque "else" que recreaba los perfiles.
          // ===============================================================================================
          if (docSnap.exists()) {
            // Si el documento ya existe, simplemente lo cargamos en el estado.
            setUserData({ uid: user.uid, ...docSnap.data() });
          } else {
            // Si el documento NO existe (porque fue borrado o es un login social sin perfil),
            // simplemente dejamos userData como null. No hacemos nada.
            setUserData(null);
            console.log(`Perfil para usuario ${user.uid} no encontrado en Firestore. Esto es normal si fue eliminado.`);
          }
          // ===============================================================================================
          // FIN DE LA MODIFICACIÓN
          // ===============================================================================================

          setLoading(false);
        }, (error) => {
          console.error("Error con el listener de Firestore:", error);
          setUserData(null);
          setLoading(false);
        });

        return () => unsubscribeFirestore();

      } else {
        // No hay usuario, limpiamos todo.
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const value = { currentUser, userData, cargandoAuth };
  
  return (
    <AuthContext.Provider value={value}>
      {!cargandoAuth && children}
    </AuthContext.Provider>
  );
}
