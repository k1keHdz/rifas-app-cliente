// src/utils/rifaHelper.js

/**
 * Añade ceros a la izquierda a un número de boleto basado en el total de boletos del sorteo.
 * @param {number|string} number - El número del boleto a formatear.
 * @param {number|string} totalTickets - El número total de boletos en el sorteo.
 * @returns {string} - El número de boleto formateado con ceros a la izquierda.
 */
export const formatTicketNumber = (number, totalTickets) => {
  if (!totalTickets || Number(totalTickets) <= 0) {
    return String(number);
  }
  const paddingLength = String(Number(totalTickets) - 1).length;
  return String(number).padStart(paddingLength, '0');
};

/**
 * Genera el texto descriptivo de la condición del sorteo.
 * @param {object} rifa - El objeto de la rifa.
 * @returns {string} - El texto descriptivo.
 */
export const getDrawConditionText = (rifa) => {
  const { tipoRifa, porcentajeVenta, fechaCierre } = rifa;

  // --- INICIO DE CORRECCIÓN: Nueva lógica de texto ---
  switch (tipoRifa) {
    case 'fechaConCondicion':
      if (fechaCierre?.toDate && porcentajeVenta) {
        return `Se sortea el ${fechaCierre.toDate().toLocaleDateString('es-MX')} si se alcanza el ${porcentajeVenta}% de venta. De lo contrario, se pospondrá hasta alcanzar la meta.`;
      }
      break;
    case 'porcentaje':
      if (porcentajeVenta) {
        return `Se realiza al alcanzar el ${porcentajeVenta}% de boletos vendidos.`;
      }
      break;
    case 'fecha':
      if (fechaCierre?.toDate) {
        return `Se realiza el ${fechaCierre.toDate().toLocaleDateString('es-MX')} (fecha fija).`;
      }
      break;
    default:
      // Si el tipo es combinado pero falta algún dato, se muestra esto.
      if (fechaCierre?.toDate && porcentajeVenta) {
         return `Se sortea al alcanzar el ${porcentajeVenta}% o en la fecha ${fechaCierre.toDate().toLocaleDateString('es-MX')}, lo que ocurra primero.`;
      }
      break;
  }
  // --- FIN DE CORRECCIÓN ---
  
  return 'Condición de sorteo no definida.';
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
