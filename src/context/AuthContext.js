import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
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

    // Efecto 1: Escucha los cambios de estado de autenticación de Firebase.
    useEffect(() => {
        const auth = getAuth();
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            // Si no hay usuario, la carga ha terminado.
            if (!user) {
                setLoading(false);
            }
        });
        return () => unsubscribeAuth();
    }, []);

    // Efecto 2: Escucha los cambios en los datos del usuario en Firestore, SÓLO si hay un usuario.
    useEffect(() => {
        // Si hay un usuario, buscamos sus datos.
        if (currentUser) {
            // Activamos el estado de carga mientras se obtienen los datos.
            setLoading(true); 
            const userRef = doc(db, 'usuarios', currentUser.uid);
            
            const unsubscribeFirestore = onSnapshot(userRef, (docSnap) => {
                if (docSnap.exists()) {
                    setUserData({ uid: currentUser.uid, ...docSnap.data() });
                } else {
                    setUserData(null);
                }
                // La carga termina cuando se reciben los datos (o se confirma que no existen).
                setLoading(false); 
            }, (error) => {
                console.error("Error al obtener datos del usuario:", error);
                setUserData(null);
                setLoading(false); 
            });

            return () => unsubscribeFirestore();
        } else {
            // Si no hay usuario (currentUser es null), limpiamos los datos y nos aseguramos de que no esté cargando.
            setUserData(null);
            setLoading(false);
        }
    }, [currentUser]); // La única dependencia correcta para este efecto es 'currentUser'.

    const value = useMemo(() => ({
        currentUser,
        userData,
        cargandoAuth,
        updateUserData
    }), [currentUser, userData, cargandoAuth, updateUserData]);
    
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}