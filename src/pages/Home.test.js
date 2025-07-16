import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Home from './Home';

// --- Mocks (Sin cambios) ---
jest.mock('../config/firebaseConfig', () => ({
  db: {},
}));
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  getDocs: jest.fn(),
  limit: jest.fn(),
}));

// --- Fin de Mocks ---

const renderHomePage = () => {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );
};

describe('Página de Inicio (Home.js)', () => {
  const { getDocs } = require('firebase/firestore');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería mostrar el estado de "Cargando..." inicialmente', () => {
    getDocs.mockReturnValue(new Promise(() => {}));
    renderHomePage();
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('debería mostrar las rifas activas y finalizadas cuando la carga es exitosa', async () => {
    const mockRifasActivas = [
      { id: 'act-1', nombre: 'Increíble Coche Rojo', precio: 200, boletos: 100, boletosVendidos: 50 },
    ];
    const mockRifasFinalizadas = [
      { id: 'fin-1', nombre: 'Viaje a la Playa', precio: 150, boletos: 200, boletosVendidos: 200 },
    ];

    getDocs.mockResolvedValueOnce({
      docs: mockRifasActivas.map(rifa => ({ id: rifa.id, data: () => rifa }))
    });
    getDocs.mockResolvedValueOnce({
      docs: mockRifasFinalizadas.map(rifa => ({ id: rifa.id, data: () => rifa }))
    });
    
    renderHomePage();

    expect(await screen.findByText('Increíble Coche Rojo')).toBeInTheDocument();
    expect(screen.getByText('Viaje a la Playa')).toBeInTheDocument();
  });

  it('debería mostrar un mensaje cuando no hay sorteos activos', async () => {
    // CORRECCIÓN: Añadimos 'precio' y otras propiedades necesarias a la data de prueba.
    const mockRifasFinalizadas = [
      { id: 'fin-1', nombre: 'Sorteo Viejo', precio: 50, boletos: 100, boletosVendidos: 100 }
    ];

    getDocs.mockResolvedValueOnce({ docs: [] }); // Rifas activas vacías
    getDocs.mockResolvedValueOnce({
      docs: mockRifasFinalizadas.map(rifa => ({ id: rifa.id, data: () => rifa }))
    });

    renderHomePage();

    expect(await screen.findByText('No hay sorteos disponibles')).toBeInTheDocument();
    // Verificamos que la rifa finalizada sí se renderiza correctamente
    expect(screen.getByText('Sorteo Viejo')).toBeInTheDocument();
  });

  it('debería abrir el modal de resultados al hacer clic en una rifa finalizada', async () => {
    const user = userEvent.setup();
    // CORRECCIÓN: Añadimos 'precio' y 'boletosVendidos' a la data de prueba.
    const mockRifaFinalizada = { id: 'fin-1', nombre: 'Rifa Finalizada Test', precio: 100, boletos: 100, boletosVendidos: 100 };
    
    getDocs.mockResolvedValueOnce({ docs: [] }); // Activas
    getDocs.mockResolvedValueOnce({
      docs: [{ id: mockRifaFinalizada.id, data: () => mockRifaFinalizada }]
    });
    
    const mockWinner = { rifaId: 'fin-1', nombreRifa: 'Rifa Finalizada Test', numeroGanador: 77 };
    getDocs.mockResolvedValueOnce({
      empty: false,
      docs: [{ data: () => mockWinner }]
    });

    renderHomePage();

    const botonResultados = await screen.findByRole('button', { name: /Ver Resultados/i });
    await user.click(botonResultados);

    expect(await screen.findByText('Boleto Ganador:')).toBeInTheDocument();
    expect(screen.getByText('77')).toBeInTheDocument();
  });
});