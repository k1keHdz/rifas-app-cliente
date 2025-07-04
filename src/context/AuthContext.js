// src/context/AuthContext.js

import React, { useState, useEffect, useContext, useCallback } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
// CORREGIDO: Ruta actualizada para la configuración de Firebase
import { db } from '../config/firebaseConfig';

const AuthContext = React.createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [cargandoAuth, setLoading] = useState(true);

    const updateUserData = useCallback((newData) => {
        setUserData(prevData => ({ ...prevData, ...newData }));
    }, []);

    useEffect(() => {
        const auth = getAuth();
        // Esta es la suscripción principal que escucha cambios de login/logout en Firebase Auth
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);

            // Si el usuario cierra sesión (user es null), limpiamos los datos y terminamos la carga.
            if (!user) {
                setUserData(null);
                setLoading(false);
            }
            // Si el usuario inicia sesión, el resto se maneja en el siguiente useEffect.
        });

        // Nos aseguramos de cancelar la suscripción al desmontar el componente para evitar fugas de memoria.
        return () => unsubscribeAuth();
    }, []);

    // MEJORADO: Este useEffect se dedica exclusivamente a escuchar los datos del usuario logueado.
    // Se activa solo cuando 'currentUser' cambia.
    useEffect(() => {
        // Si no hay usuario, no hacemos nada.
        if (!currentUser) return;

        // Creamos una referencia al documento del usuario en Firestore.
        const userRef = doc(db, 'usuarios', currentUser.uid);
        
        // Esta es la suscripción que escucha cambios en el perfil del usuario en la base de datos.
        const unsubscribeFirestore = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                setUserData({ uid: currentUser.uid, ...docSnap.data() });
            } else {
                setUserData(null);
                console.log(`Perfil para usuario ${currentUser.uid} no encontrado.`);
            }
            // Marcamos la carga como completa solo después de intentar obtener los datos de Firestore.
            setLoading(false);
        }, (error) => {
            console.error("Error con el listener de Firestore:", error);
            setUserData(null);
            setLoading(false);
        });

        // Cancelamos la suscripción a los datos del perfil si el usuario cierra sesión o el componente se desmonta.
        return () => unsubscribeFirestore();

    }, [currentUser]); // La dependencia clave es 'currentUser'.

    const value = { currentUser, userData, cargandoAuth, updateUserData };
    
    return (
        <AuthContext.Provider value={value}>
            {/* Renderizamos a los hijos solo cuando la autenticación inicial ha terminado */}
            {!cargandoAuth && children}
        </AuthContext.Provider>
    );
}
