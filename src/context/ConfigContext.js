// src/context/ConfigContext.js

import React, { createContext, useState, useEffect, useContext } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const ConfigContext = createContext();

export function useConfig() {
    return useContext(ConfigContext);
}

export function ConfigProvider({ children }) {
    const [config, setConfig] = useState(null);
    const [cargandoConfig, setCargandoConfig] = useState(true);

    useEffect(() => {
        const configDocRef = doc(db, 'configuracion', 'features');

        const unsubscribe = onSnapshot(configDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setConfig(docSnap.data());
            } else {
                console.log("No se encontró el documento de configuración, se usarán valores por defecto.");
                setConfig({
                    showGanadoresPage: true,
                    cooldownActivado: false,
                    cooldownMinutos: 5,
                });
            }
            setCargandoConfig(false);
        }, (error) => {
            console.error("Error al cargar la configuración en tiempo real:", error);
            setCargandoConfig(false);
        });

        return () => unsubscribe();
    }, []);

    const value = {
        config,
        cargandoConfig,
    };

    return (
        <ConfigContext.Provider value={value}>
            {children}
        </ConfigContext.Provider>
    );
}
