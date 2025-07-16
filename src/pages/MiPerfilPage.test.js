import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom';

// 1. Importamos el componente a probar
import MiPerfilPage from './MiPerfilPage';

// --- Mocking de Dependencias ---

// EL CORTAFUEGOS: Mockeamos nuestro PROPIO archivo de config para que no se ejecute.
jest.mock('../config/firebaseConfig', () => ({
  db: {}, // Devolvemos un objeto vacío para la 'db'
}));

// Mockeamos los hooks y el resto de dependencias
jest.mock('../context/AuthContext');
jest.mock('../context/ConfigContext');
jest.mock('firebase/auth');
jest.mock('firebase/firestore');

// Mockeamos componentes hijos para simplificar la prueba
jest.mock('../components/modals/FeedbackModal', () => ({ type, title, message }) => (
  type ? <div data-testid="feedback-modal">{title}: {message}</div> : null
));
jest.mock('../components/ui/Avatar', () => () => <div data-testid="avatar-mock" />);
jest.mock('../components/ui/ContadorRegresivo', () => () => <div data-testid="contador-mock" />);

// --- Fin del Mocking ---


// Importamos los hooks ya mockeados para poder controlarlos
const { useAuth } = require('../context/AuthContext');
const { useConfig } = require('../context/ConfigContext');
const { onSnapshot, updateDoc, getDoc } = require('firebase/firestore');
const { updatePassword, reauthenticateWithCredential, EmailAuthProvider } = require('firebase/auth');


// Función de ayuda para renderizar
const renderPage = () => {
  return render(
    <MemoryRouter>
      <MiPerfilPage />
    </MemoryRouter>
  );
};

describe('Página Mi Perfil (MiPerfilPage.js)', () => {

  beforeEach(() => {
    // Reseteamos y configuramos los mocks antes de cada prueba
    jest.clearAllMocks();
    
    useAuth.mockReturnValue({
      currentUser: { uid: 'user123', email: 'test@example.com', providerData: [{ providerId: 'password' }] },
      userData: { nombre: 'Juan', apellidos: 'Perez', estado: 'Jalisco', telefono: '5551234567' },
      updateUserData: jest.fn(),
      cargandoAuth: false,
    });
    useConfig.mockReturnValue({
      datosGenerales: {},
      mensajesConfig: {},
      cargandoConfig: false,
    });
    
    // Mock por defecto para onSnapshot (historial vacío)
    onSnapshot.mockImplementation((q, callback) => {
      callback({ docs: [] }); // Devuelve un snapshot vacío
      return () => {}; // Devuelve una función de unsubscribe
    });
  });

  it('debería mostrar los datos del usuario en los campos del formulario', async () => {
    renderPage();
    
    // Cambiamos a la pestaña de "Mis Datos"
    await userEvent.click(screen.getByRole('button', { name: /Mis Datos/i }));

    // Verificamos que los inputs tienen los valores del mock de useAuth
    expect(screen.getByLabelText(/Nombre\(s\)/i)).toHaveValue('Juan');
    expect(screen.getByLabelText(/Apellidos/i)).toHaveValue('Perez');
  });

  it('debería mostrar el historial de compras si existen', async () => {
    // Sobreescribimos el mock de onSnapshot para esta prueba específica
    const mockCompras = [
      { id: 'compra-1', data: () => ({ rifaId: 'rifa-1', nombreRifa: 'Rifa Asombrosa', cantidad: 1, estado: 'pagado', numeros: [101] }) }
    ];
    onSnapshot.mockImplementation((q, callback) => {
      callback({ docs: mockCompras });
      return () => {};
    });
    // Y el de getDoc para los detalles de la rifa
    getDoc.mockResolvedValue({ exists: () => true, data: () => ({ boletos: 1000 }) });

    renderPage();

    // Verificamos que la información de la compra se renderiza
    expect(await screen.findByText('Rifa Asombrosa')).toBeInTheDocument();
    expect(screen.getByText('1 boleto(s)')).toBeInTheDocument();
  });

  it('debería llamar a updateDoc cuando se guardan los datos del perfil', async () => {
    renderPage();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Mis Datos/i }));
    
    const inputNombre = screen.getByLabelText(/Nombre\(s\)/i);
    await user.clear(inputNombre);
    await user.type(inputNombre, 'Pedro');
    
    await user.click(screen.getByRole('button', { name: /Guardar Cambios/i }));

    await waitFor(() => {
      expect(updateDoc).toHaveBeenCalledTimes(1);
    });
    
    expect(await screen.findByTestId('feedback-modal')).toHaveTextContent('¡Éxito!');
  });
});