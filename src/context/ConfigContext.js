// src/context/ConfigContext.js

import React, { createContext, useState, useEffect, useContext } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
// CORREGIDO: Ruta actualizada para la configuración de Firebase
import { db } from '../config/firebaseConfig';

const ConfigContext = createContext();

export function useConfig() {
    return useContext(ConfigContext);
}

export function ConfigProvider({ children }) {
    const [featuresConfig, setFeaturesConfig] = useState(null);
    const [datosGenerales, setDatosGenerales] = useState(null);
    const [cargandoFeatures, setCargandoFeatures] = useState(true);
    const [cargandoGenerales, setCargandoGenerales] = useState(true);

    // Este useEffect se encarga de leer el documento 'features'
    useEffect(() => {
        const featuresDocRef = doc(db, 'configuracion', 'features');
        const unsubscribe = onSnapshot(featuresDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setFeaturesConfig(docSnap.data());
            } else {
                console.log("No se encontró el documento de 'features', se usarán valores por defecto.");
                setFeaturesConfig({
                    showGanadoresPage: true,
                    cooldownActivado: false,
                    cooldownMinutos: 5,
                });
            }
            setCargandoFeatures(false);
        }, (error) => {
            console.error("Error al cargar la configuración de 'features':", error);
            setCargandoFeatures(false);
        });

        return () => unsubscribe();
    }, []);

    // Este useEffect se encarga de leer nuestros 'datosGenerales'
    useEffect(() => {
        const generalesDocRef = doc(db, 'configuracion', 'datosGenerales');
        const unsubscribe = onSnapshot(generalesDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setDatosGenerales(docSnap.data());
            } else {
                console.log("No se encontró el documento de 'datosGenerales', se usarán valores por defecto.");
                setDatosGenerales({
                    WhatsappPrincipal: '5210000000000',
                    urlFacebook: 'https://facebook.com',
                });
            }
            setCargandoGenerales(false);
        }, (error) => {
            console.error("Error al cargar los datos generales:", error);
            setCargandoGenerales(false);
        });

        return () => unsubscribe();
    }, []);

    const value = {
        config: featuresConfig,
        datosGenerales: datosGenerales,
        cargandoConfig: cargandoFeatures || cargandoGenerales,
    };

    return (
        <ConfigContext.Provider value={value}>
            {children}
        </ConfigContext.Provider>
    );
}
