// src/utils/rifaHelper.js

/**
 * Genera el texto descriptivo de la condición del sorteo.
 * @param {object} rifa - El objeto de la rifa.
 * @returns {string} - El texto descriptivo.
 */
export const getDrawConditionText = (rifa) => {
  if (rifa.tipoRifa === 'porcentaje' && rifa.porcentajeVenta) {
    return `Se realiza al alcanzar el ${rifa.porcentajeVenta}% de boletos vendidos`;
  }
  if (rifa.tipoRifa === 'fecha' && rifa.fechaCierre?.toDate) {
    return `Se realiza el ${rifa.fechaCierre.toDate().toLocaleDateString()} (por fecha establecida)`;
  }
  return 'Condición de sorteo no definida';
};

/**
 * Calcula los contadores de boletos.
 * @param {object} rifa - El objeto de la rifa.
 * @returns {object} - Un objeto con total, vendidos, disponibles y porcentaje.
 */
export const getTicketCounts = (rifa) => {
  const total = Number(rifa.boletos || 0);
  const vendidos = Number(rifa.boletosVendidos || 0);
  const disponibles = total - vendidos;
  const porcentaje = total > 0 ? (vendidos / total) * 100 : 0;

  return { total, vendidos, disponibles, porcentaje };
};