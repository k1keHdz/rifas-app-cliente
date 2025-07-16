// 1. Mock de la dependencia. Se pone al principio de todo.
// Jest automáticamente se asegura de que esto se aplique antes que nada.
jest.mock('../../utils/rifaHelper', () => ({
  formatTicketNumber: (number) => String(number).padStart(2, '0'),
}));

// 2. Imports normales, como en cualquier otro archivo.
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import BuscadorBoletos from './BuscadorBoletos'; // Importación normal.

describe('BuscadorBoletos', () => {
  // Preparamos nuestra función "espía" una sola vez.
  const mockOnSelectBoleto = jest.fn();

  // Props base que podemos reutilizar y modificar en cada prueba.
  const baseProps = {
    totalBoletos: 100,
    boletosOcupados: new Set([10, 20, 30]),
    boletosSeleccionados: [5, 15],
    onSelectBoleto: mockOnSelectBoleto,
  };

  // Después de cada prueba, solo limpiamos el historial de la función espía.
  afterEach(() => {
    mockOnSelectBoleto.mockClear();
  });

  it('debería renderizarse correctamente en su estado inicial', () => {
    render(<BuscadorBoletos {...baseProps} />);
    expect(screen.getByText('Busca un Boleto Específico')).toBeInTheDocument();
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('debería mostrar estado "DISPONIBLE" y el botón de añadir para un boleto válido', async () => {
    const user = userEvent.setup();
    render(<BuscadorBoletos {...baseProps} />);
    
    const input = screen.getByRole('spinbutton');
    await user.type(input, '45');

    expect(await screen.findByText('DISPONIBLE')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Añadir 45/i })).toBeInTheDocument();
  });

  it('debería mostrar estado "NO DISPONIBLE" para un boleto ocupado', async () => {
    const user = userEvent.setup();
    render(<BuscadorBoletos {...baseProps} />);
    
    const input = screen.getByRole('spinbutton');
    await user.type(input, '20');

    expect(await screen.findByText('NO DISPONIBLE')).toBeInTheDocument();
  });

  it('debería llamar a onSelectBoleto y limpiar el input al hacer clic en Añadir', async () => {
    const user = userEvent.setup();
    render(<BuscadorBoletos {...baseProps} />);
    
    const input = screen.getByRole('spinbutton');
    await user.type(input, '45');
    
    const botonAñadir = await screen.findByRole('button', { name: /Añadir 45/i });
    await user.click(botonAñadir);

    expect(mockOnSelectBoleto).toHaveBeenCalledTimes(1);
    expect(mockOnSelectBoleto).toHaveBeenCalledWith(45);
    expect(input.value).toBe('');
  });

  it('NO debería mostrar el botón de añadir si el boleto ya está seleccionado', async () => {
    const user = userEvent.setup();
    // Usamos las props base y sobreescribimos boletosSeleccionados para esta prueba específica
    const props = { ...baseProps, boletosSeleccionados: [5] };
    render(<BuscadorBoletos {...props} />);
    
    const input = screen.getByRole('spinbutton');
    await user.type(input, '5');

    expect(await screen.findByText('DISPONIBLE')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});