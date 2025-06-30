// functions/index.js

const admin = require("firebase-admin");
const { onDocumentDeleted, onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { logger } = require("firebase-functions/v2");
const { nanoid } = require("nanoid");

admin.initializeApp();

// --- FUNCIONES EXISTENTES (SIN CAMBIOS) ---
exports.onrifadeleted = onDocumentDeleted("rifas/{rifaId}", async (event) => {
    const rifaId = event.params.rifaId;
    logger.info(`[INICIO] Limpieza en cascada para la rifa: ${rifaId}`);
    try {
        const db = admin.firestore();
        const bucket = admin.storage().bucket();
        const ventasRef = db.collection("rifas").doc(rifaId).collection("ventas");
        const ventasSnapshot = await ventasRef.get();
        if (!ventasSnapshot.empty) {
            const batch = db.batch();
            ventasSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
            await batch.commit();
        }
        const folderPathSorteo = `sorteos/${rifaId}/`;
        try {
            await bucket.deleteFiles({ prefix: folderPathSorteo });
        } catch(e) {
            logger.error(`Aviso: No se pudo eliminar la carpeta ${folderPathSorteo}.`, e.message);
        }
        const ganadoresRef = db.collection("ganadores");
        const ganadoresQuery = ganadoresRef.where("rifaId", "==", rifaId);
        const ganadoresSnapshot = await ganadoresQuery.get();
        if (!ganadoresSnapshot.empty) {
            const deletePromises = [];
            ganadoresSnapshot.forEach((doc) => {
                const ganador = doc.data();
                if (ganador.fotoURL) { try { const filePath = decodeURIComponent(ganador.fotoURL.split("/o/")[1].split("?")[0]); deletePromises.push(bucket.file(filePath).delete()); } catch (e) { logger.error(`Error procesando fotoURL de ganador: ${ganador.fotoURL}`, e); } }
                if (ganador.videoURL) { try { const filePath = decodeURIComponent(ganador.videoURL.split("/o/")[1].split("?")[0]); deletePromises.push(bucket.file(filePath).delete()); } catch (e) { logger.error(`Error procesando videoURL de ganador: ${ganador.videoURL}`, e); } }
                deletePromises.push(doc.ref.delete());
            });
            await Promise.all(deletePromises);
        }
        logger.info(`[FIN] Limpieza completada para la rifa: ${rifaId}`);
        return null;
    } catch (error) {
        logger.error(`[ERROR GENERAL] Falló la limpieza para la rifa ${rifaId}`, error);
        return null;
    }
});

exports.addAdminRole = onCall(async (request) => {
    if (request.auth?.token?.admin !== true) {
        throw new HttpsError('unauthenticated', 'Solo un administrador puede realizar esta acción.');
    }
    const email = request.data.email;
    if (!email || typeof email !== 'string') {
        throw new HttpsError('invalid-argument', 'Se requiere un email.');
    }
    try {
        const user = await admin.auth().getUserByEmail(email);
        await admin.auth().setCustomUserClaims(user.uid, { admin: true });
        return { result: `¡Éxito! El usuario ${email} ahora es administrador.` };
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            throw new HttpsError('not-found', 'Error: No se encontró ningún usuario con ese correo electrónico.');
        }
        throw new HttpsError('internal', 'Ocurrió un error inesperado.');
    }
});

exports.verificarBoletosPorTelefono = onCall(async (request) => {
    const telefono = request.data.telefono;
    if (!telefono || typeof telefono !== 'string' || telefono.length < 10) {
        throw new HttpsError('invalid-argument', 'El número de teléfono no es válido.');
    }
    try {
        const db = admin.firestore();
        const ventasRef = db.collectionGroup('ventas');
        const q = ventasRef.where('comprador.telefono', '==', telefono);
        const querySnapshot = await q.get();
        if (querySnapshot.empty) return [];
        const ventasData = await Promise.all(querySnapshot.docs.map(async (docSnap) => {
            const venta = docSnap.data();
            const rifaRef = db.collection('rifas').doc(venta.rifaId);
            const rifaSnap = await rifaRef.get();
            return {
                id: docSnap.id, type: 'telefono', nombreRifa: venta.nombreRifa, cantidad: venta.cantidad, estado: venta.estado,
                numeros: venta.numeros, fechaExpiracion: venta.fechaExpiracion || null, totalBoletos: rifaSnap.exists() ? rifaSnap.data().boletos : 100,
            };
        }));
        ventasData.sort((a, b) => (b.fechaExpiracion?.seconds || 0) - (a.fechaExpiracion?.seconds || 0));
        return ventasData;
    } catch (error) {
        logger.error(`Error crítico en la búsqueda para el teléfono ${telefono}:`, error);
        throw new HttpsError('internal', 'Error al buscar tus boletos.');
    }
});

exports.onVentaCreada = onDocumentCreated("rifas/{rifaId}/ventas/{ventaId}", async (event) => {
    const venta = event.data.data();
    const comprador = venta.comprador;
    if (!comprador || !comprador.telefono) {
        logger.warn(`Venta ${event.params.ventaId} sin teléfono de comprador. No se puede actualizar cliente.`);
        return null;
    }
    const db = admin.firestore();
    const clienteRef = db.collection('clientes').doc(comprador.telefono);
    try {
        await db.runTransaction(async (t) => {
            const clienteDoc = await t.get(clienteRef);
            if (!clienteDoc.exists) {
                t.set(clienteRef, {
                    nombre: comprador.nombre, apellidos: comprador.apellidos || '', telefono: comprador.telefono,
                    email: comprador.email || '', estado: comprador.estado || 'N/A', totalBoletos: venta.cantidad,
                    fechaPrimeraCompra: venta.fechaApartado, ultimaActualizacion: admin.firestore.FieldValue.serverTimestamp(),
                });
            } else {
                t.update(clienteRef, {
                    nombre: comprador.nombre, apellidos: comprador.apellidos || '', email: comprador.email || '',
                    estado: comprador.estado || 'N/A', totalBoletos: admin.firestore.FieldValue.increment(venta.cantidad),
                    ultimaActualizacion: admin.firestore.FieldValue.serverTimestamp(),
                });
            }
        });
    } catch (error) {
        logger.error(`Error en transacción para cliente ${comprador.telefono}:`, error);
    }
});

exports.recalcularClientes = onCall(async (request) => {
    if (request.auth?.token?.admin !== true) throw new HttpsError('unauthenticated', 'Acción no autorizada.');
    const db = admin.firestore();
    const clientesMap = new Map();
    try {
        const ventasSnapshot = await db.collectionGroup('ventas').get();
        ventasSnapshot.forEach(doc => {
            const venta = doc.data();
            const telefono = venta.comprador?.telefono;
            if (!telefono) return;
            if (!clientesMap.has(telefono)) {
                clientesMap.set(telefono, {
                    nombre: venta.comprador.nombre, apellidos: venta.comprador.apellidos || '', telefono: telefono,
                    email: venta.comprador.email || '', estado: venta.comprador.estado || 'N/A',
                    fechaPrimeraCompra: venta.fechaApartado, totalBoletos: venta.cantidad || 0,
                    ultimaActualizacion: admin.firestore.FieldValue.serverTimestamp(),
                });
            } else {
                const cliente = clientesMap.get(telefono);
                cliente.totalBoletos += venta.cantidad || 0;
                if (venta.fechaApartado < cliente.fechaPrimeraCompra) cliente.fechaPrimeraCompra = venta.fechaApartado;
                cliente.nombre = venta.comprador.nombre;
                cliente.apellidos = venta.comprador.apellidos || '';
                cliente.email = venta.comprador.email || '';
                cliente.estado = venta.comprador.estado || 'N/A';
            }
        });
        const batch = db.batch();
        clientesMap.forEach((data, telefono) => batch.set(db.collection('clientes').doc(telefono), data));
        await batch.commit();
        return { message: `¡Éxito! Se procesaron y guardaron ${clientesMap.size} clientes.` };
    } catch (error) {
        logger.error("Error en recálculo de clientes:", error);
        throw new HttpsError('internal', 'Falló el proceso de recálculo.');
    }
});


/**
 * Robot MANUAL para generar ventas de prueba.
 */
exports.generarVentasDePrueba = onCall(async (request) => {
    if (request.auth?.token?.admin !== true) {
        throw new HttpsError('unauthenticated', 'Solo un administrador puede realizar esta acción.');
    }
    
    const { rifaId, cantidad } = request.data;
    if (!rifaId || !cantidad || typeof cantidad !== 'number' || cantidad <= 0) {
        throw new HttpsError('invalid-argument', 'Se requiere un ID de sorteo y una cantidad válida.');
    }

    logger.info(`Iniciando generación de ${cantidad} ventas de prueba para el sorteo: ${rifaId}`);
    const db = admin.firestore();
    const rifaRef = db.collection('rifas').doc(rifaId);
    const ventasRef = rifaRef.collection('ventas');

    try {
        const rifaDoc = await rifaRef.get();
        if (!rifaDoc.exists) {
            throw new HttpsError('not-found', 'El sorteo de prueba especificado no existe.');
        }

        const rifaData = rifaDoc.data();
        const totalBoletos = rifaData.boletos;
        const ventasActuales = await ventasRef.get();
        const boletosOcupados = new Set(ventasActuales.docs.flatMap(doc => doc.data().numeros));

        let boletosDisponibles = [];
        for (let i = 0; i < totalBoletos; i++) {
            if (!boletosOcupados.has(i)) {
                boletosDisponibles.push(i);
            }
        }

        if (boletosDisponibles.length < cantidad) {
            throw new HttpsError('failed-precondition', `No hay suficientes boletos disponibles. Solo quedan ${boletosDisponibles.length}.`);
        }

        const batch = db.batch();

        for (let i = 0; i < cantidad; i++) {
            const randomIndex = Math.floor(Math.random() * boletosDisponibles.length);
            const boletoSeleccionado = boletosDisponibles.splice(randomIndex, 1)[0];
            
            const ventaData = {
                idCompra: `TEST-${nanoid(6).toUpperCase()}`,
                comprador: {
                    nombre: `Cliente Prueba ${i + 1}`,
                    apellidos: 'Automático',
                    telefono: `555000${String(i).padStart(4, '0')}`,
                    estado: 'Pruebalandia',
                    email: `test${i+1}@example.com`,
                },
                numeros: [boletoSeleccionado],
                cantidad: 1,
                // CORRECCIÓN: Se crea como 'apartado' para un flujo de prueba realista.
                estado: 'apartado', 
                fechaApartado: admin.firestore.FieldValue.serverTimestamp(),
                // Se añade una fecha de expiración para que los datos sean consistentes.
                fechaExpiracion: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 12 * 60 * 60 * 1000)),
                rifaId: rifaId,
                nombreRifa: rifaData.nombre,
                imagenRifa: rifaData.imagenes?.[0] || null,
                userId: null,
                precioBoleto: rifaData.precio,
            };
            
            const nuevaVentaRef = ventasRef.doc();
            batch.set(nuevaVentaRef, ventaData);
        }
        
        // CORRECCIÓN: El robot ya no actualiza el contador principal directamente.
        // La actualización de "boletosVendidos" debe ser probada a través de la función "Confirmar Pago"
        // que sí es parte del flujo real de la aplicación.
        // El robot `onVentaCreada` se encargará de actualizar la colección de clientes.
        
        await batch.commit();

        const successMessage = `¡Éxito! Se generaron y guardaron ${cantidad} ventas de prueba en estado "apartado".`;
        logger.info(successMessage);
        return { message: successMessage };

    } catch (error) {
        logger.error(`Error crítico durante la generación de ventas de prueba:`, error);
        if (error instanceof HttpsError) throw error;
        throw new HttpsError('internal', 'Falló el proceso de generación de ventas.');
    }
});

