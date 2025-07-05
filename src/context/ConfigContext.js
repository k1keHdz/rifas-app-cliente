import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
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

    useEffect(() => {
        const featuresDocRef = doc(db, 'configuracion', 'features');
        const unsubscribe = onSnapshot(featuresDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setFeaturesConfig(docSnap.data());
            } else {
                setFeaturesConfig({
                    showGanadoresPage: true,
                    cooldownActivado: false,
                    cooldownMinutos: 5,
                });
            }
            setCargandoFeatures(false);
        }, (error) => {
            console.error("Error al cargar la configuración de 'features':", error);
            setFeaturesConfig({
                showGanadoresPage: true,
                cooldownActivado: false,
                cooldownMinutos: 5,
            });
            setCargandoFeatures(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const generalesDocRef = doc(db, 'configuracion', 'datosGenerales');
        const unsubscribe = onSnapshot(generalesDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setDatosGenerales(docSnap.data());
            } else {
                setDatosGenerales({
                    WhatsappPrincipal: '5210000000000',
                    logoURL: '', // Se asegura que la propiedad exista
                });
            }
            setCargandoGenerales(false);
        }, (error) => {
            console.error("Error al cargar los datos generales:", error);
            setDatosGenerales({
                WhatsappPrincipal: '5210000000000',
                logoURL: '',
            });
            setCargandoGenerales(false);
        });

        return () => unsubscribe();
    }, []);

    const cargandoConfig = cargandoFeatures || cargandoGenerales;

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