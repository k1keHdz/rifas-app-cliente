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

    useEffect(() => {
        const auth = getAuth();
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            if (!user) {
                setLoading(false);
            }
        });
        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        if (currentUser) {
            setLoading(true); 
            const userRef = doc(db, 'usuarios', currentUser.uid);
            
            const unsubscribeFirestore = onSnapshot(userRef, (docSnap) => {
                if (docSnap.exists()) {
                    setUserData({ uid: currentUser.uid, ...docSnap.data() });
                } else {
                    setUserData(null);
                }
                setLoading(false); 
            }, (error) => {
                console.error("Error al obtener datos del usuario:", error);
                setUserData(null);
                setLoading(false); 
            });

            return () => unsubscribeFirestore();
        } else {
            setUserData(null);
            setLoading(false);
        }
    }, [currentUser]);

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