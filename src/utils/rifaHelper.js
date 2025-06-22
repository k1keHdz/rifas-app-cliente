// src/utils/rifaHelper.js

/**
 * Añade ceros a la izquierda a un número de boleto.
 */
export const formatTicketNumber = (number, totalTickets) => {
  if (!totalTickets || Number(totalTickets) <= 0) {
    return String(number);
  }
  const paddingLength = String(Number(totalTickets) - 1).length;
  return String(number).padStart(paddingLength, '0');
};

/**
 * Genera el texto descriptivo de la condición del sorteo, en modo detallado o resumido.
 * @param {object} rifa - El objeto de la rifa.
 * @param {string} mode - El modo de texto ('detallado' o 'resumido'). Por defecto es 'detallado'.
 * @returns {string} - El texto descriptivo.
 */
export const getDrawConditionText = (rifa, mode = 'detallado') => {
  if (!rifa) return 'Condición no definida.';

  const { tipoRifa, porcentajeVenta, fechaCierre } = rifa;
  
  const formatDate = (timestamp, short = false) => {
      if (!timestamp?.toDate) return '';
      const date = timestamp.toDate();
      if (short) {
          return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
      }
      return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  const detailedDate = formatDate(fechaCierre);
  const shortDate = formatDate(fechaCierre, true);

  if (mode === 'resumido') {
    switch (tipoRifa) {
      case 'fechaConCondicion':
        return `Fecha: ${shortDate} (si se vende ${porcentajeVenta}%)`;
      case 'porcentaje':
        return `Meta: ${porcentajeVenta}% de venta`;
      case 'fecha':
        return `Fecha del sorteo: ${shortDate}`;
      default: // combinado
         if (fechaCierre && porcentajeVenta) {
            return `Fecha: ${shortDate} o al ${porcentajeVenta}%`;
         }
         return 'Sorteo por definir';
    }
  }

  // Modo detallado (default)
  switch (tipoRifa) {
    case 'fechaConCondicion':
      if (detailedDate && porcentajeVenta) {
        return `Se sortea el ${detailedDate} si se alcanza el ${porcentajeVenta}% de venta. De lo contrario, se pospondrá hasta alcanzar la meta.`;
      }
      break;
    case 'porcentaje':
      if (porcentajeVenta) {
        return `Se realiza al alcanzar el ${porcentajeVenta}% de boletos vendidos.`;
      }
      break;
    case 'fecha':
      if (detailedDate) {
        return `Se realiza el ${detailedDate} (fecha fija).`;
      }
      break;
    default:
      if (detailedDate && porcentajeVenta) {
        return `Se sortea al alcanzar el ${porcentajeVenta}% o en la fecha ${detailedDate}, lo que ocurra primero.`;
      }
      break;
  }
  
  return 'Condición de sorteo no definida.';
};


/**
 * Calcula los contadores de boletos.
 */
export const getTicketCounts = (rifa) => {
  const total = Number(rifa.boletos || 0);
  const vendidos = Number(rifa.boletosVendidos || 0);
  const disponibles = total - vendidos;
  const porcentaje = total > 0 ? (vendidos / total) * 100 : 0;

  return { total, vendidos, disponibles, porcentaje };
};
