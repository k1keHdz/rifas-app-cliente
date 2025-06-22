// functions/index.js

const admin = require("firebase-admin");
// =================================================================================================
// INICIO DE LA CORRECIÓN: Se importan TODAS las funciones desde la versión 2 (v2) del SDK
// =================================================================================================
const { onDocumentDeleted } = require("firebase-functions/v2/firestore");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { logger } = require("firebase-functions/v2");
// =================================================================================================
// FIN DE LA CORRECIÓN
// =================================================================================================

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
 * Solo puede ser llamada por un usuario que ya sea administrador.
 */
// =================================================================================================
// INICIO DE LA CORRECIÓN: Se reescribe la función usando la sintaxis de v2 (onCall)
// =================================================================================================
exports.addAdminRole = onCall(async (request) => {
  // 1. Verificar que quien llama sea un administrador.
  if (request.auth?.token?.admin !== true) {
    logger.error("Petición no autorizada. Quien llama no es admin.", { uid: request.auth?.uid });
    throw new HttpsError('unauthenticated', 'Petición no autorizada. Solo un administrador puede realizar esta acción.');
  }

  // 2. Obtener el email del cuerpo de la petición.
  const email = request.data.email;
  if (!email || typeof email !== 'string') {
    throw new HttpsError('invalid-argument', 'Petición incorrecta. Se requiere un email.');
  }

  try {
    // 3. Buscar al usuario por su email.
    const user = await admin.auth().getUserByEmail(email);
    
    // 4. Asignar el Custom Claim de 'admin'.
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
// =================================================================================================
// FIN DE LA CORRECIÓN
// =================================================================================================
