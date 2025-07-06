import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

const ConfigContext = createContext();

export function useConfig() {
    return useContext(ConfigContext);
}

// ==================================================================================
// CENTRALIZACIÓN DE TODAS LAS PLANTILLAS DE MENSAJES
// Esta es ahora la única fuente de verdad para las plantillas por defecto.
// ==================================================================================
export const initialMensajesConfig = {
    plantillaApartadoCliente: {
        label: "Mensaje de Apartado (Cliente)",
        description: "Este es el mensaje que el cliente envía para iniciar su apartado.",
        variables: ['nombreCliente', 'nombreRifa', 'idCompra', 'listaBoletos', 'totalPagar', 'horasApartado'],
        template: `¡Hola, {nombreCliente}! 👋 Quiero apartar mis boletos para: "{nombreRifa}".\n\n*ID de Compra: {idCompra}*\n\nMis números seleccionados son: *{listaBoletos}*.\nTotal a pagar: *{totalPagar}*.\n\nQuedo a la espera de las instrucciones para realizar el pago. ¡Tengo {horasApartado} horas para completarlo! Gracias.`
    },
    plantillaNotificacionGanador: {
        label: "Mensaje de Notificación al Ganador (Admin)",
        description: "Mensaje para felicitar al ganador de un sorteo desde el Gestor de Ganadores.",
        variables: ['nombreCliente', 'nombreRifa', 'numeroBoleto'],
        template: `🎉 ¡MUCHAS FELICIDADES, {nombreCliente}! 🎉\n\n¡Eres el afortunado ganador del sorteo "{nombreRifa}" con el boleto número *{numeroBoleto}*!\n\nNos pondremos en contacto contigo muy pronto para coordinar la entrega de tu premio. ¡Gracias por participar!`
    },
    plantillaPagoConfirmadoAdmin: {
        label: "Mensaje de Pago Confirmado (Admin)",
        description: "Mensaje para notificar a un cliente que su pago ha sido validado y sus boletos están confirmados.",
        variables: ['nombreCliente', 'nombreRifa', 'idCompra', 'listaBoletos'],
        template: `¡Felicidades, {nombreCliente}! 🎉 Tu pago para: "{nombreRifa}" ha sido confirmado.\n\nID de Compra: *{idCompra}*\n\n*Tus números:* {listaBoletos}\n\n¡Te deseamos mucha suerte en el sorteo!`
    },
    plantillaRecordatorioPagoAdmin: {
        label: "Mensaje de Recordatorio de Pago (Admin)",
        description: "Mensaje para recordar a un cliente sobre un apartado expirado o a punto de expirar.",
        variables: ['nombreCliente', 'nombreRifa', 'listaBoletos'],
        template: `¡Hola, {nombreCliente}! 👋 Te escribimos para recordarte sobre tu apartado para: "{nombreRifa}" con los boletos *{listaBoletos}*.\n\nNotamos que tu pago está pendiente. ¡No te preocupes! Contáctanos por este medio para ayudarte a completar la compra y asegurar tus boletos. ¡No te quedes fuera!`
    },
    plantillaConsultaCompraUsuario: {
        label: "Mensaje de Consulta de Compra (Usuario)",
        description: "Mensaje que un usuario envía desde su perfil para consultar el estado de una compra apartada.",
        variables: ['nombreRifa', 'listaBoletos', 'idCompra'],
        template: `¡Hola! 👋 Tengo una consulta sobre mi compra para: "{nombreRifa}".\n\nID de Compra: *{idCompra}*\nMis números son: *{listaBoletos}*.\n\nMi compra aún aparece como 'apartado' y me gustaría verificar el estado de mi pago. ¡Gracias!`
    }
};

// Función helper para extraer solo las plantillas de texto para guardar en Firestore
const getTemplatesOnly = (config) => {
    return Object.keys(config).reduce((acc, key) => {
        acc[key] = config[key].template;
        return acc;
    }, {});
};


export function ConfigProvider({ children }) {
    const [featuresConfig, setFeaturesConfig] = useState(null);
    const [datosGenerales, setDatosGenerales] = useState(null);
    const [mensajesConfig, setMensajesConfig] = useState(null);

    const [cargandoFeatures, setCargandoFeatures] = useState(true);
    const [cargandoGenerales, setCargandoGenerales] = useState(true);
    const [cargandoMensajes, setCargandoMensajes] = useState(true);

    useEffect(() => {
        const featuresDocRef = doc(db, 'configuracion', 'features');
        const unsubscribe = onSnapshot(featuresDocRef, (docSnap) => {
            const defaultConfig = {
                showGanadoresPage: true,
                cooldownActivado: false,
                cooldownMinutos: 5,
                tiempoApartadoHoras: 24,
            };
            setFeaturesConfig(docSnap.exists() ? { ...defaultConfig, ...docSnap.data() } : defaultConfig);
            setCargandoFeatures(false);
        }, (error) => {
            console.error("Error al cargar la configuración de 'features':", error);
            setFeaturesConfig({ showGanadoresPage: true, cooldownActivado: false, cooldownMinutos: 5, tiempoApartadoHoras: 24 });
            setCargandoFeatures(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const generalesDocRef = doc(db, 'configuracion', 'datosGenerales');
        const unsubscribe = onSnapshot(generalesDocRef, (docSnap) => {
            const defaultGenerales = { WhatsappPrincipal: '', logoURL: '' };
            setDatosGenerales(docSnap.exists() ? { ...defaultGenerales, ...docSnap.data() } : defaultGenerales);
            setCargandoGenerales(false);
        }, (error) => {
            console.error("Error al cargar los datos generales:", error);
            setDatosGenerales({ WhatsappPrincipal: '', logoURL: '' });
            setCargandoGenerales(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const mensajesDocRef = doc(db, 'configuracion', 'mensajesWhatsapp');
        const defaultTemplates = getTemplatesOnly(initialMensajesConfig);

        const unsubscribe = onSnapshot(mensajesDocRef, (docSnap) => {
            if (docSnap.exists()) {
                // Combina los defaults con lo que viene de Firestore.
                // Esto asegura que si se añade una nueva plantilla en el código, no se rompa la app.
                setMensajesConfig({ ...defaultTemplates, ...docSnap.data() });
            } else {
                setMensajesConfig(defaultTemplates);
            }
            setCargandoMensajes(false);
        }, (error) => {
            console.error("Error al cargar la configuración de mensajes:", error);
            setMensajesConfig(defaultTemplates);
            setCargandoMensajes(false);
        });
        return () => unsubscribe();
    }, []);

    const cargandoConfig = cargandoFeatures || cargandoGenerales || cargandoMensajes;

    const value = useMemo(() => ({
        config: featuresConfig,
        datosGenerales: datosGenerales,
        mensajesConfig: mensajesConfig,
        cargandoConfig,
    }), [featuresConfig, datosGenerales, mensajesConfig, cargandoConfig]);

    return (
        <ConfigContext.Provider value={value}>
            {children}
        </ConfigContext.Provider>
    );
}
