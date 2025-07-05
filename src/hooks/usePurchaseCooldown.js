// --- src/hooks/usePurchaseCooldown.js ---
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

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
    const checkCooldown = async (config, currentUser, userData) => {
        if (!config || !config.cooldownActivado) {
            return { isOnCooldown: false, timeLeft: '' };
        }
        let lastPurchaseTime = null;
        if (currentUser && userData?.ultimaCompraTimestamp) {
            lastPurchaseTime = userData.ultimaCompraTimestamp.toDate().getTime();
        } else if (!currentUser) {
            const guestTimestamp = localStorage.getItem('guestLastPurchase');
            if (guestTimestamp) {
                lastPurchaseTime = parseInt(guestTimestamp, 10);
            }
        }
        if (!lastPurchaseTime) {
            return { isOnCooldown: false, timeLeft: '' };
        }
        const now = Date.now();
        const cooldownMillis = config.cooldownMinutos * 60 * 1000;
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

    const setCooldown = async (config, currentUser) => {
        if (!config || !config.cooldownActivado) return;
        if (currentUser) {
            try {
                const userRef = doc(db, 'usuarios', currentUser.uid);
                await updateDoc(userRef, {
                    ultimaCompraTimestamp: serverTimestamp()
                });
            } catch (error) {
                console.error("Error al establecer cooldown para usuario registrado:", error);
            }
        } else {
            localStorage.setItem('guestLastPurchase', Date.now().toString());
        }
    };
    return { checkCooldown, setCooldown };
};