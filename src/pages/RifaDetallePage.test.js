import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom';

// 1. Importamos el componente a probar
import RifaDetallePage from './RifaDetallePage';

// --- Mocking de Dependencias ---

// Mockeamos TODOS los hooks y componentes que RifaDetallePage importa
jest.mock('../context/AuthContext');
jest.mock('../context/ConfigContext');
jest.mock('../hooks/useBoletos');
jest.mock('../hooks/usePurchaseCooldown');
jest.mock('firebase/firestore'); // También la llamada directa a onSnapshot

// Mockeamos los componentes hijos para aislarlos
jest.mock('../components/modals/ModalDatosComprador', () => () => <div data-testid="modal-datos-comprador" />);
jest.mock('../components/modals/ModalInvitacionRegistro', () => () => <div data-testid="modal-invitacion" />);
jest.mock('../components/modals/ModalCooldown', () => () => <div data-testid="modal-cooldown" />);
jest.mock('../components/rifas/SelectorBoletos', () => () => <div data-testid="selector-boletos" />);
jest.mock('../components/rifas/BuscadorBoletos', () => () => <div data-testid="buscador-boletos" />);

// --- Fin del Mocking ---


// 3. Importamos los hooks ya mockeados para poder controlarlos
const { useAuth } = require('../context/AuthContext');
const { useConfig } = require('../context/ConfigContext');
const { useBoletos } = require('../hooks/useBoletos');
const { usePurchaseCooldown } = require('../hooks/usePurchaseCooldown');
const { onSnapshot } = require('firebase/firestore');


// 4. Función de ayuda para renderizar la página dentro de un entorno de rutas
const renderPage = () => {
  return render(
    <MemoryRouter initialEntries={['/rifa/rifa-de-prueba']}>
      <Routes>
        <Route path="/rifa/:id" element={<RifaDetallePage />} />
      </Routes>
    </MemoryRouter>
  );
};


describe('Página de Detalle de Rifa (RifaDetallePage.js)', () => {
  // Antes de cada prueba, definimos el comportamiento por defecto de nuestros mocks
  beforeEach(() => {
    jest.clearAllMocks();

    // Estado por defecto: todo cargado, usuario logueado, sin cooldown, 2 boletos seleccionados
    useAuth.mockReturnValue({ currentUser: { uid: 'user123' }, userData: { rol: 'user' }, cargandoAuth: false });
    useConfig.mockReturnValue({ config: { tiempoApartadoHoras: 12 }, cargandoConfig: false });
    useBoletos.mockReturnValue({
      boletosSeleccionados: [10, 20],
      boletosOcupados: new Map(),
      cargandoBoletos: false,
      toggleBoleto: jest.fn(),
      limpiarSeleccion: jest.fn(),
    });
    usePurchaseCooldown.mockReturnValue({
      checkCooldown: jest.fn().mockResolvedValue({ isOnCooldown: false }),
      setCooldown: jest.fn(),
    });

    // Simulamos que Firebase encuentra la rifa
    onSnapshot.mockImplementation((docRef, callback) => {
      const mockDoc = {
        exists: () => true,
        id: 'rifa-de-prueba',
        data: () => ({ nombre: 'Rifa Definitiva', descripcion: 'Descripción de prueba', precio: 50, estado: 'activa', boletos: 100 }),
      };
      callback(mockDoc);
      return () => {}; // Devuelve una función 'unsubscribe' vacía
    });
  });

  it('debería mostrar los detalles de la rifa y los componentes principales cuando todo carga correctamente', async () => {
    renderPage();

    // Verificamos que el nombre de la rifa (que viene de nuestro mock de onSnapshot) se renderiza
    expect(await screen.findByText('Rifa Definitiva')).toBeInTheDocument();
    
    // Verificamos que los componentes hijos (mockeados) están en pantalla
    expect(screen.getByTestId('selector-boletos')).toBeInTheDocument();
    expect(screen.getByTestId('buscador-boletos')).toBeInTheDocument();
    
    // Verificamos que la información del hook useBoletos se muestra
    expect(screen.getByText('2 BOLETO(S) SELECCIONADO(S)')).toBeInTheDocument();
  });

  it('debería mostrar el modal de datos de comprador si un usuario logueado hace clic en apartar', async () => {
    const user = userEvent.setup();
    renderPage();

    const botonApartar = await screen.findByRole('button', { name: /Apartar por WhatsApp/i });
    await user.click(botonApartar);
    
    // Verificamos que el modal correcto aparece
    expect(screen.getByTestId('modal-datos-comprador')).toBeInTheDocument();
  });
  
  it('debería mostrar el modal de invitación si un invitado hace clic en apartar', async () => {
    const user = userEvent.setup();
    // Sobreescribimos el mock de useAuth para simular un invitado
    useAuth.mockReturnValue({ currentUser: null, userData: null, cargandoAuth: false });
    
    renderPage();
    
    const botonApartar = await screen.findByRole('button', { name: /Apartar por WhatsApp/i });
    await user.click(botonApartar);

    expect(screen.getByTestId('modal-invitacion')).toBeInTheDocument();
  });

  it('debería mostrar el modal de cooldown si el usuario está en enfriamiento', async () => {
    const user = userEvent.setup();
    // Sobreescribimos el mock de usePurchaseCooldown
    usePurchaseCooldown.mockReturnValue({
      checkCooldown: jest.fn().mockResolvedValue({ isOnCooldown: true, timeLeft: '5 minutos' }),
    });

    renderPage();

    const botonApartar = await screen.findByRole('button', { name: /Apartar por WhatsApp/i });
    await user.click(botonApartar);

    expect(screen.getByTestId('modal-cooldown')).toBeInTheDocument();
  });

  it('debería mostrar un mensaje de "Sorteo no encontrado" si Firebase no encuentra la rifa', async () => {
    // Sobreescribimos el mock de onSnapshot para que simule que no encuentra nada
    onSnapshot.mockImplementation((docRef, callback) => {
      callback({ exists: () => false });
      return () => {};
    });

    renderPage();

    expect(await screen.findByText('Sorteo no encontrado')).toBeInTheDocument();
  });
});