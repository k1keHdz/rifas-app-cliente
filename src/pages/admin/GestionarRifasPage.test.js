import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import GestionarRifasPage from './GestionarRifasPage';
import { useRifas } from '../../context/RifasContext';

// Mocks
jest.mock('../../context/RifasContext');
jest.mock('../../config/firebaseConfig', () => ({ db: {}, storage: {} }));
jest.mock('firebase/firestore');
jest.mock('firebase/storage');
jest.mock('../../components/ui/Alerta', () => ({ mensaje }) => <div data-testid="alerta">{mensaje}</div>);

const { doc, deleteDoc, setDoc } = require('firebase/firestore');
const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');

describe('Página de Gestión de Sorteos', () => {
  const mockShowFeedback = jest.fn();
  const mockOcultarFormulario = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    window.confirm = jest.fn(() => true);
  });

  it('debería poder llenar el formulario y crear una nueva rifa', async () => {
    const user = userEvent.setup();
    useRifas.mockReturnValue({
      rifaSeleccionada: null, isFormVisible: true, rifas: [], cargando: false,
      showFeedback: mockShowFeedback, ocultarFormulario: mockOcultarFormulario, feedback: {},
    });
    
    uploadBytes.mockResolvedValue({});
    getDownloadURL.mockResolvedValue('http://fake-url.com/imagen.jpg');
    setDoc.mockResolvedValue({});

    render(<MemoryRouter><GestionarRifasPage /></MemoryRouter>);
    
    // Llenado del formulario
    await user.type(screen.getByLabelText(/Nombre del Sorteo/i), 'Rifa Final');
    await user.type(screen.getByRole('textbox', { name: /Descripción/i }), 'Desc');
    await user.type(screen.getByLabelText(/Precio por Boleto/i), '10');
    await user.type(screen.getByLabelText(/Total de Boletos/i), '100');

    // Subida de imagen
    await user.click(screen.getByRole('button', { name: /Imágenes/i }));
    const file = new File(['(⌐□_□)'], 'chuck.png', { type: 'image/png' });
    await user.upload(screen.getByLabelText(/Añadir Nuevas Imágenes/i), file);
    
    // Llenado de reglas
    await user.click(screen.getByRole('button', { name: /Reglas/i }));
    await user.type(screen.getByLabelText(/Porcentaje de Venta/i), '80');

    // Envío
    await user.click(screen.getByRole('button', { name: /Guardar Sorteo/i }));

    // Verificación
    await waitFor(() => {
      expect(setDoc).toHaveBeenCalledTimes(1);
    });
    expect(mockShowFeedback).toHaveBeenCalledWith("Sorteo agregado exitosamente", "exito");
  });
});