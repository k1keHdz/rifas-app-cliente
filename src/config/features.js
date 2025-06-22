// src/config/features.js

/**
 * Este archivo contiene los "interruptores" (feature flags) para activar o desactivar
 * funcionalidades específicas en la aplicación de forma fácil y segura.
 */

export const FEATURES = {
    // Para ocultar la página de ganadores, cambia este valor a 'false'.
    // Para mostrarla de nuevo, cámbialo a 'true'.
    showGanadoresPage: true, 
    
    // ===============================================================================================
    // NUEVOS INTERRUPTORES PARA EL COOLDOWN DE COMPRA
    // ===============================================================================================
    
    // Para activar el tiempo de espera entre compras, cambia este valor a 'true'.
    // Para desactivar el tiempo de espera entre compras, cambia este valor a 'false'.
    cooldownActivado: false,

    // Define el tiempo de espera en minutos.
    cooldownMinutos: 5,
};
