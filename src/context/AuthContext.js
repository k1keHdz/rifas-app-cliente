import React, { useState, useEffect, useContext, useCallback } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const AuthContext = React.createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [cargandoAuth, setLoading] = useState(true);

    // Función para permitir que otros componentes actualicen el estado de userData
    const updateUserData = useCallback((newData) => {
        setUserData(prevData => ({ ...prevData, ...newData }));
    }, []);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);

            if (user) {
                const userRef = doc(db, 'usuarios', user.uid);
                const unsubscribeFirestore = onSnapshot(userRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setUserData({ uid: user.uid, ...docSnap.data() });
                    } else {
                        setUserData(null);
                        console.log(`Perfil para usuario ${user.uid} no encontrado.`);
                    }
                    setLoading(false);
                }, (error) => {
                    console.error("Error con el listener de Firestore:", error);
                    setUserData(null);
                    setLoading(false);
                });
                return () => unsubscribeFirestore();
            } else {
                setUserData(null);
                setLoading(false);
            }
        });
        return () => unsubscribeAuth();
    }, []);

    // Incluir updateUserData en el valor del contexto
    const value = { currentUser, userData, cargandoAuth, updateUserData };
    
    return (
        <AuthContext.Provider value={value}>
            {!cargandoAuth && children}
        </AuthContext.Provider>
    );
}
