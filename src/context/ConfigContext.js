// src/context/ConfigContext.js

import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

const ConfigContext = createContext();

export function useConfig() {
    return useContext(ConfigContext);
}

// Valores por defecto estables, definidos fuera del componente.
const DEFAULT_FEATURES = {
    showGanadoresPage: true,
    cooldownActivado: false,
    cooldownMinutos: 5,
};

const DEFAULT_GENERALES = {
    logoURL: '', // Se asegura que la propiedad siempre exista.
    WhatsappPrincipal: '5210000000000',
};

export function ConfigProvider({ children }) {
    const [featuresConfig, setFeaturesConfig] = useState(DEFAULT_FEATURES);
    const [datosGenerales, setDatosGenerales] = useState(DEFAULT_GENERALES);
    const [cargandoConfig, setCargandoConfig] = useState(true);

    // Efecto unificado para cargar toda la configuración en una sola petición.
    useEffect(() => {
        const configCollectionRef = collection(db, 'configuracion');
        const unsubscribe = onSnapshot(configCollectionRef, (snapshot) => {
            let featuresData = null;
            let generalesData = null;

            snapshot.forEach((doc) => {
                if (doc.id === 'features') {
                    featuresData = doc.data();
                } else if (doc.id === 'datosGenerales') {
                    generalesData = doc.data();
                }
            });

            // Se combinan los datos de Firebase con los valores por defecto.
            setFeaturesConfig({ ...DEFAULT_FEATURES, ...featuresData });
            setDatosGenerales({ ...DEFAULT_GENERALES, ...generalesData });

            setCargandoConfig(false);
        }, (error) => {
            console.error("Error al cargar la configuración unificada:", error);
            setFeaturesConfig(DEFAULT_FEATURES);
            setDatosGenerales(DEFAULT_GENERALES);
            setCargandoConfig(false);
        });

        return () => unsubscribe();
    }, []);

    const value = useMemo(() => ({
        config: featuresConfig,
        datosGenerales: datosGenerales,
        cargandoConfig,
    }), [featuresConfig, datosGenerales, cargandoConfig]);

    return (
        <ConfigContext.Provider value={value}>
            {children}
        </ConfigContext.Provider>
    );
}
