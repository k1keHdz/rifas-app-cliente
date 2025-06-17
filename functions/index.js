// functions/index.js

const admin = require("firebase-admin");
const { onDocumentDeleted } = require("firebase-functions/v2/firestore");
const { Storage } = require("@google-cloud/storage");
const functions = require("firebase-functions");

admin.initializeApp();
const storage = new Storage();
const logger = functions.logger;

/**
 * Se activa cuando un documento en 'rifas' es eliminado.
 * Realiza la limpieza en cascada de todos los datos asociados.
 */
exports.onrifadeleted = onDocumentDeleted("rifas/{rifaId}", async (event) => {
  const rifaId = event.params.rifaId;
  logger.info(`[INICIO] Limpieza en cascada para la rifa: ${rifaId}`);

  try {
    const db = admin.firestore();
    const bucket = admin.storage().bucket();

    // Tarea 1: Eliminar la subcolección 'ventas'
    logger.info(`Tarea 1: Borrando subcolección 'ventas' de ${rifaId}`);
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

    // Tarea 2: Eliminar imágenes de la rifa en Firebase Storage
    const folderPathRifa = `rifas/${rifaId}/`;
    logger.info(`Tarea 2: Borrando archivos de Storage en: ${folderPathRifa}`);
    await bucket.deleteFiles({ prefix: folderPathRifa });
    logger.info(` -> Éxito: Carpeta de la rifa en Storage eliminada.`);
    
    // Tarea 3: Eliminar los ganadores asociados y sus archivos
    logger.info(`Tarea 3: Buscando ganadores asociados a ${rifaId}`);
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

        // Borrar foto del ganador
        if (ganador.fotoURL) {
          try {
            const filePath = decodeURIComponent(ganador.fotoURL.split("/o/")[1].split("?")[0]);
            deletePromises.push(bucket.file(filePath).delete());
            logger.info(`  --> Añadida a cola de borrado (foto): ${filePath}`);
          } catch (e) {
            logger.error(`  --> Error al procesar URL de foto: ${ganador.fotoURL}`, e);
          }
        }
        // Borrar video del ganador
        if (ganador.videoURL) {
          try {
            const filePath = decodeURIComponent(ganador.videoURL.split("/o/")[1].split("?")[0]);
            deletePromises.push(bucket.file(filePath).delete());
            logger.info(`  --> Añadida a cola de borrado (video): ${filePath}`);
          } catch (e) {
            logger.error(`  --> Error al procesar URL de video: ${ganador.videoURL}`, e);
          }
        }
        // Borrar el documento del ganador
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
