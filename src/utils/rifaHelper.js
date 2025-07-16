/**
 * Genera un mensaje a partir de una plantilla y un objeto de variables.
 * Reemplaza todas las ocurrencias de {variable} en la plantilla.
 * @param {string} plantilla - El texto base con placeholders como {nombreCliente}.
 * @param {object} variables - Un objeto donde las claves son los nombres de las variables sin llaves.
 * @returns {string} El mensaje final con las variables reemplazadas.
 */
export const generarMensajeDesdePlantilla = (plantilla, variables) => {
    if (!plantilla) return '';
  
    // Usamos una Expresión Regular para encontrar CUALQUIER {variable} en la plantilla.
    // El patrón /{(\w+)}/g busca "{" seguido de una o más letras/números y luego "}".
    // (match, key) -> match es el texto completo (e.g., "{nombre}"), key es solo el contenido (e.g., "nombre").
    return plantilla.replace(/{(\w+)}/g, (match, key) => {
      // Para cada {variable} encontrada, la reemplazamos con su valor. Si no existe, usamos ''.
      return variables[key] || '';
    });
};

export const formatTicketNumber = (number, totalTickets) => {
    if (!totalTickets || Number(totalTickets) <= 0) {
        return String(number);
    }
    const paddingLength = String(Number(totalTickets) - 1).length;
    return String(number).padStart(paddingLength, '0');
};

export const getDrawConditionText = (rifa, mode = 'detallado') => {
    if (!rifa) return 'Condición no definida.';

    const { tipoRifa, porcentajeVenta, fechaCierre } = rifa;
    
    const formatDate = (timestamp, short = false) => {
        if (!timestamp?.toDate) return '';
        const date = timestamp.toDate();
        if (short) {
            // Creamos el formato manualmente para asegurar consistencia.
            const day = date.getDate();
            const month = date.toLocaleDateString('es-MX', { month: 'short' }).replace('.', ''); // Quitamos el punto si lo hubiera
            return `${day} de ${month}.`; // Produce: "28 de oct."
        }
        return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    const detailedDate = formatDate(fechaCierre);
    const shortDate = formatDate(fechaCierre, true); // Ahora producirá '28 de oct.'

    if (mode === 'resumido') {
        switch (tipoRifa) {
            case 'fechaConCondicion':
                return `Fecha: ${shortDate} (si se vende ${porcentajeVenta}%)`;
            case 'porcentaje':
                return `Meta: ${porcentajeVenta}% de venta`;
            case 'fecha':
                return `Fecha del sorteo: ${shortDate}`;
            default:
                if (fechaCierre && porcentajeVenta) {
                    return `Fecha: ${shortDate} o al ${porcentajeVenta}%`;
                }
                return 'Sorteo por definir';
        }
    }

    switch (tipoRifa) {
        case 'fechaConCondicion':
            if (detailedDate && porcentajeVenta) {
                return `Se sortea el ${detailedDate} si se alcanza el ${porcentajeVenta}% de boletos vendidos. De lo contrario, se pospondrá hasta alcanzar la meta.`;
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

export const getTicketCounts = (rifa) => {
    const total = Number(rifa.boletos || 0);
    const vendidos = Number(rifa.boletosVendidos || 0);
    const disponibles = total - vendidos;
    const porcentaje = total > 0 ? (vendidos / total) * 100 : 0;

    return { total, vendidos, disponibles, porcentaje };
};