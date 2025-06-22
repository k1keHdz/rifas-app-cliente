// src/hooks/usePurchaseCooldown.js

import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { FEATURES } from '../config/features';

// Función auxiliar para formatear el tiempo restante en un texto legible.
const formatTimeLeft = (ms) => {
    const totalSeconds = Math.round(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes > 0) {
        return `${minutes} minuto(s) y ${seconds} segundo(s)`;
    }
    return `${seconds} segundo(s)`;
};

export const usePurchaseCooldown = () => {

    /**
     * Revisa si el usuario (registrado o invitado) está en periodo de cooldown.
     * @param {object} currentUser - El objeto de usuario de Firebase Auth.
     * @param {object} userData - Los datos del perfil del usuario desde Firestore.
     * @returns {Promise<{isOnCooldown: boolean, timeLeft: string}>} - Un objeto indicando si está en cooldown y el tiempo restante.
     */
    const checkCooldown = async (currentUser, userData) => {
        if (!FEATURES.cooldownActivado) {
            return { isOnCooldown: false, timeLeft: '' };
        }

        let lastPurchaseTime = null;

        // Para usuarios registrados, revisa la marca de tiempo en Firestore.
        if (currentUser && userData?.ultimaCompraTimestamp) {
            lastPurchaseTime = userData.ultimaCompraTimestamp.toDate().getTime();
        } 
        // Para usuarios invitados, revisa la marca de tiempo en el almacenamiento local del navegador.
        else if (!currentUser) {
            const guestTimestamp = localStorage.getItem('guestLastPurchase');
            if (guestTimestamp) {
                lastPurchaseTime = parseInt(guestTimestamp, 10);
            }
        }

        if (!lastPurchaseTime) {
            return { isOnCooldown: false, timeLeft: '' };
        }

        const now = Date.now();
        const cooldownMillis = FEATURES.cooldownMinutos * 60 * 1000;
        const timeElapsed = now - lastPurchaseTime;

        if (timeElapsed < cooldownMillis) {
            const timeLeftMillis = cooldownMillis - timeElapsed;
            return { 
                isOnCooldown: true, 
                timeLeft: formatTimeLeft(timeLeftMillis) 
            };
        }

        return { isOnCooldown: false, timeLeft: '' };
    };

    /**
     * Establece la marca de tiempo de la última compra para el usuario.
     * @param {object} currentUser - El objeto de usuario de Firebase Auth.
     */
    const setCooldown = async (currentUser) => {
        if (!FEATURES.cooldownActivado) return;

        // Para usuarios registrados, actualiza su documento en Firestore.
        if (currentUser) {
            try {
                const userRef = doc(db, 'usuarios', currentUser.uid);
                await updateDoc(userRef, {
                    ultimaCompraTimestamp: serverTimestamp()
                });
            } catch (error) {
                console.error("Error al establecer cooldown para usuario registrado:", error);
            }
        }
        // Para usuarios invitados, guarda en el almacenamiento local.
        else {
            localStorage.setItem('guestLastPurchase', Date.now().toString());
        }
    };

    return { checkCooldown, setCooldown };
};
