import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ContadorRegresivo from './ContadorRegresivo';

describe('ContadorRegresivo', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // PRUEBA CORREGIDA 1: Usamos findByText que espera a que aparezca el elemento
  it('debería mostrar el contador de tiempo después del estado de carga inicial', async () => {
    const futureDate = new Date(new Date().getTime() + 100000);
    render(<ContadorRegresivo fechaExpiracion={futureDate} />);

    // En lugar de buscar "Calculando...", que desaparece muy rápido,
    // buscamos el resultado final que SÍ debe permanecer en pantalla.
    // findByText esperará hasta que el texto "Expira en:" aparezca.
    const elementoFinal = await screen.findByText(/Expira en:/i);
    expect(elementoFinal).toBeInTheDocument();
  });

  it('debería mostrar el tiempo restante en formato HH:MM:SS cuando quedan menos de 24 horas', async () => {
    const ahora = new Date('2025-07-10T10:00:00Z');
    jest.setSystemTime(ahora);
    
    // La prueba original tenía 1 hora de diferencia. La hacemos más corta para ser más precisos.
    const fechaExpiracion = new Date('2025-07-10T10:10:00Z');
    render(<ContadorRegresivo fechaExpiracion={fechaExpiracion} />);

    await act(async () => {
      jest.advanceTimersByTime(1000); // Avanzamos 1 segundo
    });
    
    // El tiempo restante es ahora 9 minutos y 59 segundos.
    expect(screen.getByText(/Expira en: 00:09:59/i)).toBeInTheDocument();
  });

  // PRUEBA CORREGIDA 2: Ajustamos la expectativa
  it('debería mostrar el tiempo restante en formato Días/Horas/Minutos cuando queda más de un día', async () => {
    const ahora = new Date('2025-07-10T10:00:00Z');
    jest.setSystemTime(ahora);

    const fechaExpiracion = new Date('2025-07-12T13:00:00Z');
    render(<ContadorRegresivo fechaExpiracion={fechaExpiracion} />);

    await act(async () => {
      jest.advanceTimersByTime(1000); // Avanzamos 1 segundo
    });

    // Como avanzamos 1 segundo, el tiempo ya no es 03h 00m, sino 02h 59m.
    // Corregimos la prueba para que espere el valor correcto.
    expect(screen.getByText(/Expira en: 2d 02h 59m/i)).toBeInTheDocument();
  });

  it('debería mostrar "Tiempo Expirado" cuando la fecha ha pasado', async () => {
    const ahora = new Date('2025-07-10T12:00:00Z');
    jest.setSystemTime(ahora);

    const fechaExpiracion = new Date('2025-07-10T11:00:00Z');
    render(<ContadorRegresivo fechaExpiracion={fechaExpiracion} />);
    
    // Usamos findByText para esperar a que el estado se actualice a "Expirado"
    const elementoExpirado = await screen.findByText('Tiempo Expirado');
    expect(elementoExpirado).toBeInTheDocument();
  });

  it('debería funcionar con un objeto tipo timestamp de Firebase', async () => {
    const ahora = new Date('2025-07-10T10:00:00Z');
    jest.setSystemTime(ahora);

    const fechaExpiracionFirebase = {
      toDate: () => new Date('2025-07-10T10:05:00Z'),
    };
    render(<ContadorRegresivo fechaExpiracion={fechaExpiracionFirebase} />);

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText(/Expira en: 00:04:59/i)).toBeInTheDocument();
  });
});