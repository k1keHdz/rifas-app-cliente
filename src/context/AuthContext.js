// src/context/AuthContext.js
import React, { useState, useEffect, useContext } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore'; // Importamos setDoc y serverTimestamp
import { db } from '../firebase/firebaseConfig';

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    // onAuthStateChanged se dispara al iniciar sesión o cerrar sesión.
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);

      if (user) {
        // Si hay un usuario, escuchamos su documento en Firestore.
        const userRef = doc(db, 'usuarios', user.uid);
        const unsubscribeFirestore = onSnapshot(userRef, async (docSnap) => {
          if (docSnap.exists()) {
            // Si el documento ya existe, simplemente lo cargamos en el estado.
            setUserData({ uid: user.uid, ...docSnap.data() });
          } else {
            // ¡NUEVO! Si el documento NO existe, es un usuario nuevo (ej. primer login con Google).
            // Lo creamos en Firestore con la información del proveedor de autenticación.
            console.log("Nuevo usuario detectado, creando perfil en Firestore...");
            const newUserData = {
              uid: user.uid,
              email: user.email,
              nombre: user.displayName || '', // Tomado de Google o vacío
              apellidos: '', // Google no proporciona apellidos por defecto
              telefono: user.phoneNumber || '',
              photoURL: user.photoURL || '', // Tomado de Google o vacío
              rol: 'cliente',
              fechaCreacion: serverTimestamp(), // Fecha de creación en el servidor
            };

            try {
              // Usamos setDoc para crear el documento de forma segura.
              await setDoc(userRef, newUserData);
              // Actualizamos el estado local para una respuesta inmediata.
              setUserData(newUserData);
            } catch (error) {
              console.error("Error al crear documento de usuario:", error);
            }
          }
          setLoading(false);
        }, (error) => {
          console.error("Error con el listener de Firestore:", error);
          setLoading(false);
        });

        return () => unsubscribeFirestore(); // Limpiamos el listener de Firestore al salir.

      } else {
        // No hay usuario, limpiamos todo.
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth(); // Limpiamos el listener de Auth al desmontar.
  }, []);

  const value = { currentUser, userData, loading };
  
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
