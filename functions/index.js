// functions/index.js

const admin = require("firebase-admin");
const { onDocumentCreated, onDocumentUpdated, onDocumentDeleted } = require("firebase-functions/v2/firestore");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { logger } = require("firebase-functions/v2");
const { nanoid } = require("nanoid");

admin.initializeApp();
const db = admin.firestore();

const getPathFromStorageUrl = (url) => {
    if (!url || !url.includes("/o/")) return null;
    try {
        return decodeURIComponent(url.split("/o/")[1].split("?")[0]);
    } catch (e) {
        logger.error("No se pudo decodificar la URL de Storage:", url, e);
        return null;
    }
};

// TAREA 1.2: Lógica de contadores mejorada y centralizada.
exports.onVentaCreada = onDocumentCreated("rifas/{rifaId}/ventas/{ventaId}", async (event) => {
    const venta = event.data.data();
    const rifaId = event.params.rifaId;
    const rifaRef = db.collection('rifas').doc(rifaId);

    // --- Lógica para actualizar contadores ---
    if (venta.estado === 'comprado') {
        logger.info(`Venta [${event.params.ventaId}] creada como 'comprado'. Incrementando boletosVendidos en ${venta.cantidad}.`);
        await rifaRef.update({ boletosVendidos: admin.firestore.FieldValue.increment(venta.cantidad) });
    }
    // NOTA: No se actualiza el contador de 'apartados' aquí, ya que la lógica de apartado se maneja por separado.
    // Si en el futuro se crean ventas directamente como 'apartado', se añadiría aquí la lógica.

    // --- Lógica para gestionar clientes (sin cambios) ---
    const comprador = venta.comprador;
    if (!comprador || !comprador.telefono) {
        logger.warn(`Venta ${event.params.ventaId} sin teléfono. No se actualiza cliente.`);
        return null;
    }
    const clienteRef = db.collection('clientes').doc(comprador.telefono);
    try {
        const clienteDoc = await clienteRef.get();
        if (!clienteDoc.exists) {
            logger.info(`Creando nuevo cliente: ${comprador.telefono}`);
            await clienteRef.set({
                nombre: comprador.nombre,
                apellidos: comprador.apellidos || '',
                telefono: comprador.telefono,
                email: comprador.email || '',
                estado: comprador.estado || 'N/A',
                totalBoletosComprados: 0,
                fechaPrimeraCompra: venta.fechaApartado,
                ultimaActualizacion: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
    } catch (error) {
        logger.error(`Error en onVentaCreada para cliente ${comprador.telefono}:`, error);
    }
});

exports.onVentaUpdated = onDocumentUpdated("rifas/{rifaId}/ventas/{ventaId}", async (event) => {
    const antes = event.data.before.data();
    const despues = event.data.after.data();
    const rifaId = event.params.rifaId;
    const rifaRef = db.collection('rifas').doc(rifaId);

    // --- Lógica para actualizar contadores ---
    // Caso: Un boleto 'apartado' se confirma como 'comprado'.
    if (antes.estado === 'apartado' && despues.estado === 'comprado') {
        logger.info(`Venta [${event.params.ventaId}] actualizada a 'comprado'. Incrementando boletosVendidos en ${despues.cantidad}.`);
        // Aquí no se decrementa 'boletosApartados' porque ese contador se calcula en tiempo real en el frontend.
        // Solo se incrementa el contador de ventas firmes.
        await rifaRef.update({ boletosVendidos: admin.firestore.FieldValue.increment(despues.cantidad) });
    }

    // --- Lógica para gestionar clientes (sin cambios) ---
    const comprador = despues.comprador;
    if (!comprador || !comprador.telefono) {
        logger.warn(`Venta actualizada ${event.params.ventaId} sin teléfono.`);
        return null;
    }
    if (antes.estado !== 'apartado' || despues.estado !== 'comprado') {
        return null;
    }
    logger.info(`Venta ${event.params.ventaId} confirmada. Sumando ${despues.cantidad} boletos a ${comprador.telefono}.`);
    const clienteRef = db.collection('clientes').doc(comprador.telefono);
    return clienteRef.update({
        totalBoletosComprados: admin.firestore.FieldValue.increment(despues.cantidad),
        ultimaActualizacion: admin.firestore.FieldValue.serverTimestamp(),
    }).catch(error => {
        logger.error(`Error al actualizar boletos comprados para ${comprador.telefono}:`, error);
    });
});

// TAREA 1.2: Nueva función para manejar la eliminación de ventas.
exports.onVentaDeleted = onDocumentDeleted("rifas/{rifaId}/ventas/{ventaId}", async (event) => {
    const ventaEliminada = event.data.data();
    const rifaId = event.params.rifaId;
    const rifaRef = db.collection('rifas').doc(rifaId);

    // Si la venta eliminada estaba 'comprada', se descuenta del total de vendidos.
    if (ventaEliminada.estado === 'comprado') {
        logger.info(`Venta [${event.params.ventaId}] eliminada. Descontando ${ventaEliminada.cantidad} de boletosVendidos.`);
        return rifaRef.update({ boletosVendidos: admin.firestore.FieldValue.increment(-ventaEliminada.cantidad) });
    }
    // Si estaba 'apartada', no se hace nada en el contador de 'boletosVendidos'.
    return null;
});


// --- OTRAS FUNCIONES (SIN CAMBIOS) ---

exports.recalcularClientes = onCall(async (request) => {
    if (request.auth?.token?.admin !== true) {
        throw new HttpsError('unauthenticated', 'Acción no autorizada.');
    }
    const clientesMap = new Map();
    try {
        const todosClientesSnapshot = await db.collection('clientes').get();
        todosClientesSnapshot.forEach(doc => {
            clientesMap.set(doc.id, { ...doc.data(), totalBoletosComprados: 0 });
        });
        const ventasSnapshot = await db.collectionGroup('ventas').where('estado', '==', 'comprado').get();
        ventasSnapshot.forEach(doc => {
            const venta = doc.data();
            const telefono = venta.comprador?.telefono;
            if (telefono && clientesMap.has(telefono)) {
                const cliente = clientesMap.get(telefono);
                cliente.totalBoletosComprados += venta.cantidad || 0;
            }
        });
        const batch = db.batch();
        clientesMap.forEach((data, telefono) => {
            const clienteRef = db.collection('clientes').doc(telefono);
            batch.update(clienteRef, { totalBoletosComprados: data.totalBoletosComprados });
        });
        await batch.commit();
        return { message: `¡Éxito! Se recalcularon los totales para ${clientesMap.size} clientes.` };
    } catch (error) {
        logger.error("Error en recálculo de clientes:", error);
        throw new HttpsError('internal', 'Falló el proceso de recálculo.');
    }
});

exports.onrifadeleted = onDocumentDeleted("rifas/{rifaId}", async (event) => {
    const rifaId = event.params.rifaId;
    logger.info(`[INICIO] Limpieza en cascada para la rifa: ${rifaId}`);
    try {
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
                const fotoPath = getPathFromStorageUrl(ganador.fotoURL);
                if (fotoPath) deletePromises.push(bucket.file(fotoPath).delete());
                const videoPath = getPathFromStorageUrl(ganador.videoURL);
                if (videoPath) deletePromises.push(bucket.file(videoPath).delete());
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
                numeros: venta.numeros, fechaExpiracion: venta.fechaExpiracion ? venta.fechaExpiracion.toDate().toISOString() : null, 
                totalBoletos: rifaSnap.exists ? rifaSnap.data().boletos : 100,
            };
        }));
        ventasData.sort((a, b) => {
            const fechaA = a.fechaExpiracion ? new Date(a.fechaExpiracion).getTime() : 0;
            const fechaB = b.fechaExpiracion ? new Date(b.fechaExpiracion).getTime() : 0;
            return fechaB - fechaA;
        });
        return ventasData;
    } catch (error) {
        logger.error(`Error crítico en la búsqueda para el teléfono ${telefono}:`, error);
        throw new HttpsError('internal', 'Ocurrió un error al buscar tus boletos.');
    }
});

exports.generarVentasDePrueba = onCall(async (request) => {
    if (request.auth?.token?.admin !== true) {
        throw new HttpsError('unauthenticated', 'Solo un administrador puede realizar esta acción.');
    }
    const { rifaId, cantidad } = request.data;
    if (!rifaId || !cantidad || typeof cantidad !== 'number' || cantidad <= 0) {
        throw new HttpsError('invalid-argument', 'Se requiere un ID de sorteo y una cantidad válida.');
    }
    logger.info(`Iniciando generación de ${cantidad} ventas de prueba para el sorteo: ${rifaId}`);
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
                estado: 'apartado', 
                fechaApartado: admin.firestore.FieldValue.serverTimestamp(),
                fechaExpiracion: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 12 * 60 * 60 * 1000)),
                rifaId: rifaId,
                nombreRifa: rifaData.nombre,
                imagenRifa: rifaData.imagenes?.[0] || null,
                userId: null,
                precioBoleto: rifaData.precio,
                estadoRifa: rifaData.estado,
            };
            const nuevaVentaRef = ventasRef.doc();
            batch.set(nuevaVentaRef, ventaData);
        }
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
