import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ModalDatosComprador from './ModalDatosComprador';

// --- Mocking de Dependencias ---

// EL CORTAFUEGOS: Mockeamos nuestro PROPIO archivo de config para evitar que se ejecute.
// Ahora la importación de 'db' dentro del componente recibirá este objeto falso.
jest.mock('../../config/firebaseConfig', () => ({
  db: {}, // Un objeto vacío es suficiente, ya que `runTransaction` también será un mock.
}));

// Mockeamos solo las funciones de firestore que SÍ se llaman en el componente.
// No necesitamos `getFirestore` aquí porque el archivo que lo usa ya fue "apagado".
jest.mock('firebase/firestore', () => ({
  runTransaction: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  serverTimestamp: jest.fn(),
  Timestamp: { fromDate: (date) => date },
}));

// El resto de los mocks que ya teníamos.
jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));
jest.mock('../../context/ConfigContext', () => ({
  useConfig: jest.fn(),
}));
jest.mock('../../hooks/usePurchaseCooldown', () => ({
  usePurchaseCooldown: () => ({ setCooldown: jest.fn() }),
}));
jest.mock('nanoid', () => ({ nanoid: () => 'TEST-ID-123' }));
jest.mock('../../utils/rifaHelper');

// --- Fin del Mocking ---


describe('ModalDatosComprador', () => {
  // Importamos los hooks ya mockeados para controlarlos
  const { useAuth } = require('../../context/AuthContext');
  const { useConfig } = require('../../context/ConfigContext');
  const { runTransaction, getDocs } = require('firebase/firestore');

  const baseProps = {
    onClose: jest.fn(),
    onConflict: jest.fn(),
    limpiarSeleccion: jest.fn(),
    rifa: { id: 'rifa-1', nombre: 'Rifa Test', precio: 100, boletos: 1000 },
    boletosSeleccionados: [7],
    datosIniciales: { nombre: 'Juan', apellidos: 'Perez', estado: 'Jalisco', telefono: '5554443322' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    window.open = jest.fn();

    // Damos valores a nuestros hooks falsos para cada prueba
    useAuth.mockReturnValue({
      currentUser: { uid: 'test-user-123', email: 'test@example.com' },
    });
    useConfig.mockReturnValue({
      config: { tiempoApartadoHoras: 12 },
      datosGenerales: { WhatsappPrincipal: '1234567890' },
      mensajesConfig: { plantillaApartadoCliente: 'Test' },
    });
  });

  it('debería ejecutar una transacción exitosa y llamar a onClose', async () => {
    const user = userEvent.setup();
    // Simulamos que no hay conflictos
    getDocs.mockResolvedValue({ empty: true });
    // Simulamos que la transacción funciona
    runTransaction.mockImplementation(async (db, callback) => {
      const transaction = {
        get: jest.fn().mockResolvedValue({ exists: () => true, data: () => ({ estado: 'activa' }) }),
        set: jest.fn(),
      };
      return callback(transaction);
    });

    render(<ModalDatosComprador {...baseProps} />);
    
    await user.click(screen.getByRole('button', { name: /Confirmar y Apartar/i }));

    await waitFor(() => {
      expect(baseProps.onClose).toHaveBeenCalledTimes(1);
    });
  });
});