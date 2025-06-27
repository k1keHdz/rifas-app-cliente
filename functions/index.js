// functions/index.js

const admin = require("firebase-admin");
const { onDocumentDeleted, onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { logger } = require("firebase-functions/v2");

admin.initializeApp();

/**
 * Cloud Function para limpiar datos cuando se elimina un sorteo.
 */
exports.onrifadeleted = onDocumentDeleted("rifas/{rifaId}", async (event) => {
    const rifaId = event.params.rifaId;
    logger.info(`[INICIO] Limpieza en cascada para la rifa: ${rifaId}`);

    try {
        const db = admin.firestore();
        const bucket = admin.storage().bucket();

        // Tarea 1: Eliminar la subcolección 'ventas'
        logger.info(`Tarea 1: Borrando subcolección 'ventas' de la rifa ${rifaId}`);
        const ventasRef = db.collection("rifas").doc(rifaId).collection("ventas");
        const ventasSnapshot = await ventasRef.get();
        if (!ventasSnapshot.empty) {
            const batch = db.batch();
            ventasSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
            await batch.commit();
            logger.info(` -> Éxito: ${ventasSnapshot.size} ventas eliminadas.`);
        } else {
            logger.info(" -> No se encontraron ventas para eliminar.");
        }

        // Tarea 2: Eliminar imágenes del sorteo en Firebase Storage
        const folderPathSorteo = `sorteos/${rifaId}/`;
        logger.info(`Tarea 2: Borrando archivos de Storage en la ruta correcta: ${folderPathSorteo}`);
        try {
            await bucket.deleteFiles({ prefix: folderPathSorteo });
            logger.info(` -> Éxito: Carpeta '${folderPathSorteo}' en Storage eliminada.`);
        } catch(e) {
            logger.error(` -> Aviso: No se pudo eliminar la carpeta ${folderPathSorteo}. Puede que no existiera.`, e.message);
        }
        
        // Tarea 3: Eliminar los ganadores asociados y sus archivos
        logger.info(`Tarea 3: Buscando ganadores asociados a la rifa ${rifaId}`);
        const ganadoresRef = db.collection("ganadores");
        const ganadoresQuery = ganadoresRef.where("rifaId", "==", rifaId);
        const ganadoresSnapshot = await ganadoresQuery.get();

        if (ganadoresSnapshot.empty) {
            logger.info(" -> No se encontraron ganadores asociados.");
        } else {
            logger.info(` -> Encontrados ${ganadoresSnapshot.size} ganadores para eliminar.`);
            const deletePromises = [];
            ganadoresSnapshot.forEach((doc) => {
                const ganador = doc.data();
                if (ganador.fotoURL) {
                    try {
                        const filePath = decodeURIComponent(ganador.fotoURL.split("/o/")[1].split("?")[0]);
                        deletePromises.push(bucket.file(filePath).delete());
                        logger.info(`  --> Añadida a cola de borrado (foto): ${filePath}`);
                    } catch (e) {
                        logger.error(`  --> Error al procesar URL de foto de ganador: ${ganador.fotoURL}`, e);
                    }
                }
                if (ganador.videoURL) {
                    try {
                        const filePath = decodeURIComponent(ganador.videoURL.split("/o/")[1].split("?")[0]);
                        deletePromises.push(bucket.file(filePath).delete());
                        logger.info(`  --> Añadida a cola de borrado (video): ${filePath}`);
                    } catch (e) {
                        logger.error(`  --> Error al procesar URL de video de ganador: ${ganador.videoURL}`, e);
                    }
                }
                deletePromises.push(doc.ref.delete());
            });

            await Promise.all(deletePromises);
            logger.info(" -> Éxito: Ganadores y sus archivos eliminados.");
        }

        logger.info(`[FIN] Limpieza completada exitosamente para la rifa: ${rifaId}`);
        return null;
    } catch (error) {
        logger.error(`[ERROR GENERAL] Falló la limpieza para la rifa ${rifaId}`, error);
        return null;
    }
});


/**
 * Cloud Function HTTPS para asignar el rol de administrador a un usuario.
 */
exports.addAdminRole = onCall(async (request) => {
    if (request.auth?.token?.admin !== true) {
        logger.error("Petición no autorizada. Quien llama no es admin.", { uid: request.auth?.uid });
        throw new HttpsError('unauthenticated', 'Petición no autorizada. Solo un administrador puede realizar esta acción.');
    }

    const email = request.data.email;
    if (!email || typeof email !== 'string') {
        throw new HttpsError('invalid-argument', 'Petición incorrecta. Se requiere un email.');
    }

    try {
        const user = await admin.auth().getUserByEmail(email);
        await admin.auth().setCustomUserClaims(user.uid, { admin: true });
        logger.info(`Éxito: Se asignó el rol de admin a ${email} (UID: ${user.uid}) por ${request.auth.token.email}.`);
        return { result: `¡Éxito! El usuario ${email} ahora es administrador.` };
    } catch (error) {
        logger.error("Error al asignar rol de admin:", error);
        if (error.code === 'auth/user-not-found') {
            throw new HttpsError('not-found', 'Error: No se encontró ningún usuario con ese correo electrónico.');
        }
        throw new HttpsError('internal', 'Ocurrió un error inesperado al asignar el rol.');
    }
});


/**
 * Cloud Function HTTPS para buscar las compras de un usuario por su número de teléfono.
 */
exports.verificarBoletosPorTelefono = onCall(async (request) => {
    const telefono = request.data.telefono;
    if (!telefono || typeof telefono !== 'string' || telefono.length < 10) {
        throw new HttpsError('invalid-argument', 'El número de teléfono proporcionado no es válido.');
    }

    logger.info(`Búsqueda iniciada para el teléfono: ${telefono}`);

    try {
        const db = admin.firestore();
        const ventasRef = db.collectionGroup('ventas');
        const q = ventasRef.where('comprador.telefono', '==', telefono);
        const querySnapshot = await q.get();

        if (querySnapshot.empty) {
            logger.info(`No se encontraron ventas para el teléfono: ${telefono}`);
            return [];
        }

        const ventasData = await Promise.all(querySnapshot.docs.map(async (docSnap) => {
            const venta = docSnap.data();
            const rifaRef = db.collection('rifas').doc(venta.rifaId);
            const rifaSnap = await rifaRef.get();

            return {
                id: docSnap.id,
                type: 'telefono',
                nombreRifa: venta.nombreRifa,
                cantidad: venta.cantidad,
                estado: venta.estado,
                numeros: venta.numeros,
                fechaExpiracion: venta.fechaExpiracion || null,
                totalBoletos: rifaSnap.exists() ? rifaSnap.data().boletos : 100,
            };
        }));
        
        ventasData.sort((a, b) => {
            const dateA = a.fechaExpiracion?.seconds || 0;
            const dateB = b.fechaExpiracion?.seconds || 0;
            return dateB - dateA;
        });

        logger.info(`Búsqueda exitosa para ${telefono}. Se encontraron ${ventasData.length} compras.`);
        return ventasData;

    } catch (error) {
        logger.error(`Error crítico en la búsqueda para el teléfono ${telefono}:`, error);
        throw new HttpsError('internal', 'Ocurrió un error inesperado al buscar tus boletos.');
    }
});


// =================================================================================================
// INICIO DE LAS NUEVAS FUNCIONES PARA ESCALABILIDAD DE CLIENTES
// =================================================================================================

/**
 * Robot que se activa CADA VEZ que se crea una nueva venta.
 * Actualiza la base de datos de clientes de forma eficiente.
 */
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
        await db.runTransaction(async (transaction) => {
            const clienteDoc = await transaction.get(clienteRef);

            if (!clienteDoc.exists) {
                logger.info(`Creando nuevo cliente para el teléfono: ${comprador.telefono}`);
                transaction.set(clienteRef, {
                    nombre: comprador.nombre,
                    apellidos: comprador.apellidos || '',
                    telefono: comprador.telefono,
                    email: comprador.email || '',
                    estado: comprador.estado || 'N/A',
                    totalBoletos: venta.cantidad,
                    fechaPrimeraCompra: venta.fechaApartado,
                    ultimaActualizacion: admin.firestore.FieldValue.serverTimestamp(),
                });
            } else {
                logger.info(`Actualizando cliente existente: ${comprador.telefono}`);
                transaction.update(clienteRef, {
                    nombre: comprador.nombre,
                    apellidos: comprador.apellidos || '',
                    email: comprador.email || '',
                    estado: comprador.estado || 'N/A',
                    totalBoletos: admin.firestore.FieldValue.increment(venta.cantidad),
                    ultimaActualizacion: admin.firestore.FieldValue.serverTimestamp(),
                });
            }
        });
        logger.info(`Transacción de cliente para ${comprador.telefono} completada.`);
        return null;
    } catch (error) {
        logger.error(`Error en la transacción para el cliente ${comprador.telefono}:`, error);
        return null;
    }
});


/**
 * Robot MANUAL para procesar todas las ventas antiguas y poblar la colección de clientes.
 * Se debe llamar UNA SOLA VEZ después de desplegar.
 */
exports.recalcularClientes = onCall(async (request) => {
    if (request.auth?.token?.admin !== true) {
        throw new HttpsError('unauthenticated', 'Solo un administrador puede realizar esta acción.');
    }
    
    logger.info("Iniciando recálculo completo de la base de datos de clientes...");
    const db = admin.firestore();
    const clientesMap = new Map();

    try {
        const ventasSnapshot = await db.collectionGroup('ventas').get();
        logger.info(`Se procesarán ${ventasSnapshot.size} documentos de venta.`);

        ventasSnapshot.forEach(doc => {
            const venta = doc.data();
            const telefono = venta.comprador?.telefono;
            if (!telefono) return;

            if (!clientesMap.has(telefono)) {
                clientesMap.set(telefono, {
                    nombre: venta.comprador.nombre,
                    apellidos: venta.comprador.apellidos || '',
                    telefono: telefono,
                    email: venta.comprador.email || '',
                    estado: venta.comprador.estado || 'N/A',
                    fechaPrimeraCompra: venta.fechaApartado,
                    totalBoletos: venta.cantidad || 0,
                    ultimaActualizacion: admin.firestore.FieldValue.serverTimestamp(),
                });
            } else {
                const cliente = clientesMap.get(telefono);
                cliente.totalBoletos += venta.cantidad || 0;
                if (venta.fechaApartado < cliente.fechaPrimeraCompra) {
                    cliente.fechaPrimeraCompra = venta.fechaApartado;
                }
                cliente.nombre = venta.comprador.nombre;
                cliente.apellidos = venta.comprador.apellidos || '';
                cliente.email = venta.comprador.email || '';
                cliente.estado = venta.comprador.estado || 'N/A';
            }
        });

        logger.info(`Se encontraron ${clientesMap.size} clientes únicos. Escribiendo en la base de datos...`);

        const batch = db.batch();
        clientesMap.forEach((data, telefono) => {
            const clienteRef = db.collection('clientes').doc(telefono);
            batch.set(clienteRef, data);
        });
        await batch.commit();

        const successMessage = `¡Recálculo completado! Se han procesado y guardado ${clientesMap.size} clientes.`;
        logger.info(successMessage);
        return { message: successMessage };

    } catch (error) {
        logger.error("Error crítico durante el recálculo de clientes:", error);
        throw new HttpsError('internal', 'Falló el proceso de recálculo.');
    }
});
// =================================================================================================
// FIN DE LAS NUEVAS FUNCIONES
// =================================================================================================
