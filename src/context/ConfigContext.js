// src/context/ConfigContext.js

import React, { createContext, useState, useEffect, useContext } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const ConfigContext = createContext();

export function useConfig() {
    return useContext(ConfigContext);
}

export function ConfigProvider({ children }) {
    // MODIFICADO: Ahora tenemos dos estados para la configuración
    const [featuresConfig, setFeaturesConfig] = useState(null); // Para 'features'
    const [datosGenerales, setDatosGenerales] = useState(null); // NUEVO: Para 'datosGenerales'

    // MODIFICADO: Y dos estados de carga para controlar ambos
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

    // NUEVO: Este useEffect se encarga de leer nuestros nuevos 'datosGenerales'
    useEffect(() => {
        const generalesDocRef = doc(db, 'configuracion', 'datosGenerales');
        const unsubscribe = onSnapshot(generalesDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setDatosGenerales(docSnap.data());
            } else {
                console.log("No se encontró el documento de 'datosGenerales', se usarán valores por defecto.");
                // Proporcionamos valores por defecto para que la app no se rompa si el doc no existe
                setDatosGenerales({
                    WhatsappPrincipal: '5210000000000',
                    urlFacebook: 'https://facebook.com',
                    // ... puedes añadir más valores por defecto para los otros campos aquí
                });
            }
            setCargandoGenerales(false);
        }, (error) => {
            console.error("Error al cargar los datos generales:", error);
            setCargandoGenerales(false);
        });

        return () => unsubscribe();
    }, []);


    // MODIFICADO: El valor del contexto ahora incluye todo
    const value = {
        config: featuresConfig, // Mantenemos el nombre 'config' por compatibilidad
        datosGenerales: datosGenerales, // NUEVO: nuestros datos de contacto
        cargandoConfig: cargandoFeatures || cargandoGenerales, // La carga termina cuando AMBOS terminan
    };

    return (
        <ConfigContext.Provider value={value}>
            {children}
        </ConfigContext.Provider>
    );
}