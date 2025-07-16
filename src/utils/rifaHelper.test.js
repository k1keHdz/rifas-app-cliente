import {
  generarMensajeDesdePlantilla,
  formatTicketNumber,
  getDrawConditionText,
  getTicketCounts,
} from './rifaHelper';

// --- Pruebas para generarMensajeDesdePlantilla ---
describe('generarMensajeDesdePlantilla', () => {
  it('debería reemplazar una sola variable correctamente', () => {
    const plantilla = 'Hola, {nombre}.';
    const variables = { nombre: 'Juan' };
    const resultado = 'Hola, Juan.';
    expect(generarMensajeDesdePlantilla(plantilla, variables)).toBe(resultado);
  });

  it('debería reemplazar múltiples variables', () => {
    const plantilla = 'El boleto {boleto} fue comprado por {nombre}.';
    const variables = { nombre: 'Ana', boleto: '007' };
    const resultado = 'El boleto 007 fue comprado por Ana.';
    expect(generarMensajeDesdePlantilla(plantilla, variables)).toBe(resultado);
  });

  it('debería manejar variables no encontradas en la plantilla', () => {
    const plantilla = 'Hola, {nombre}.';
    const variables = { nombre: 'Carlos', edad: 30 };
    const resultado = 'Hola, Carlos.';
    expect(generarMensajeDesdePlantilla(plantilla, variables)).toBe(resultado);
  });

  it('debería reemplazar con un string vacío si la variable no está en el objeto', () => {
    const plantilla = 'Bienvenido, {nombre}. Tu código es {codigo}.';
    const variables = { nombre: 'Luis' };
    const resultado = 'Bienvenido, Luis. Tu código es .';
    expect(generarMensajeDesdePlantilla(plantilla, variables)).toBe(resultado);
  });

  it('debería retornar un string vacío si la plantilla es nula o indefinida', () => {
    expect(generarMensajeDesdePlantilla(null, { nombre: 'Test' })).toBe('');
    expect(generarMensajeDesdePlantilla(undefined, { nombre: 'Test' })).toBe('');
  });
});


// --- Pruebas para formatTicketNumber ---
describe('formatTicketNumber', () => {
  it('debería añadir ceros a la izquierda para un total de 100 boletos', () => {
    expect(formatTicketNumber(5, 100)).toBe('05');
  });

  it('debería añadir ceros a la izquierda para un total de 1000 boletos', () => {
    expect(formatTicketNumber(5, 1000)).toBe('005');
  });

  it('no debería añadir ceros si el número ya tiene la longitud necesaria', () => {
    expect(formatTicketNumber(99, 100)).toBe('99');
    expect(formatTicketNumber(123, 1000)).toBe('123');
  });

  it('debería manejar el número 0 correctamente', () => {
    expect(formatTicketNumber(0, 100)).toBe('00');
  });

  it('debería devolver el número como string si el total de boletos no es válido', () => {
    expect(formatTicketNumber(7, 0)).toBe('7');
    expect(formatTicketNumber(7, null)).toBe('7');
  });
});

// --- Pruebas para getTicketCounts ---
describe('getTicketCounts', () => {
  it('debería calcular correctamente los conteos y el porcentaje', () => {
    const rifa = { boletos: '100', boletosVendidos: '25' };
    const resultado = {
      total: 100,
      vendidos: 25,
      disponibles: 75,
      porcentaje: 25,
    };
    expect(getTicketCounts(rifa)).toEqual(resultado);
  });

  it('debería manejar el caso de cero boletos totales', () => {
    const rifa = { boletos: '0', boletosVendidos: '0' };
    const resultado = {
      total: 0,
      vendidos: 0,
      disponibles: 0,
      porcentaje: 0,
    };
    expect(getTicketCounts(rifa)).toEqual(resultado);
  });

  it('debería manejar datos ausentes o nulos', () => {
    const rifa = {};
    const resultado = {
      total: 0,
      vendidos: 0,
      disponibles: 0,
      porcentaje: 0,
    };
    expect(getTicketCounts(rifa)).toEqual(resultado);
  });
});


// --- Pruebas para getDrawConditionText ---
describe('getDrawConditionText', () => {
  // Objeto simulado de timestamp de Firebase para usar en las pruebas
  const mockTimestamp = {
    toDate: () => new Date('2025-10-28T00:00:00'),
  };

  it('debería retornar el texto para tipo "fecha" en modo detallado', () => {
    const rifa = { tipoRifa: 'fecha', fechaCierre: mockTimestamp };
    expect(getDrawConditionText(rifa, 'detallado')).toBe('Se realiza el 28 de octubre de 2025 (fecha fija).');
  });

  it('debería retornar el texto para tipo "fecha" en modo resumido', () => {
    const rifa = { tipoRifa: 'fecha', fechaCierre: mockTimestamp };
    expect(getDrawConditionText(rifa, 'resumido')).toBe('Fecha del sorteo: 28 de oct.');
  });
  
  it('debería retornar el texto para tipo "porcentaje" en modo detallado', () => {
    const rifa = { tipoRifa: 'porcentaje', porcentajeVenta: '80' };
    expect(getDrawConditionText(rifa, 'detallado')).toBe('Se realiza al alcanzar el 80% de boletos vendidos.');
  });
  
  it('debería retornar el texto para tipo "fechaConCondicion" en modo detallado', () => {
    const rifa = { tipoRifa: 'fechaConCondicion', porcentajeVenta: '75', fechaCierre: mockTimestamp };
    const expected = 'Se sortea el 28 de octubre de 2025 si se alcanza el 75% de boletos vendidos. De lo contrario, se pospondrá hasta alcanzar la meta.';
    expect(getDrawConditionText(rifa, 'detallado')).toBe(expected);
  });
  
  it('debería retornar el texto para tipo "fechaConCondicion" en modo resumido', () => {
    const rifa = { tipoRifa: 'fechaConCondicion', porcentajeVenta: '75', fechaCierre: mockTimestamp };
    expect(getDrawConditionText(rifa, 'resumido')).toBe('Fecha: 28 de oct. (si se vende 75%)');
  });

  it('debería retornar un texto por defecto si el objeto rifa no es válido', () => {
    expect(getDrawConditionText(null)).toBe('Condición no definida.');
  });
});