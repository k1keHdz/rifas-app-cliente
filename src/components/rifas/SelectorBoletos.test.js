// No importamos React aquí arriba porque lo haremos dentro del mock

// --- Mocking de Dependencias ---

jest.mock('../../utils/rifaHelper', () => ({
  formatTicketNumber: (number, total) => String(number).padStart(String(total - 1).length, '0'),
}));

// Mock MEJORADO Y CORREGIDO para react-window
jest.mock('react-window', () => {
  // LA SOLUCIÓN: Importamos 'React' DENTRO del bloque del mock.
  const React = require('react');

  const MockFixedSizeList = React.forwardRef(({ children: Row, itemData, itemCount, height }, ref) => (
    <div ref={ref} data-testid="fake-list" style={{ height: `${height}px` }}>
      {Array.from({ length: itemCount }, (_, index) => (
        <Row key={index} index={index} style={{}} data={itemData} />
      ))}
    </div>
  ));

  return {
    __esModule: true,
    ...jest.requireActual('react-window'),
    FixedSizeList: MockFixedSizeList,
  };
});

// --- Fin del Mocking ---

// Imports normales
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import SelectorBoletos from './SelectorBoletos';


describe('SelectorBoletos', () => {
  const mockOnToggleBoleto = jest.fn();

  const baseProps = {
    totalBoletos: 100,
    boletosOcupados: new Map([
      [10, 'comprado'],
      [25, 'apartado'],
    ]),
    boletosSeleccionados: [5, 15],
    conflictingTickets: [99],
    onToggleBoleto: mockOnToggleBoleto,
    filtroActivo: false,
    compraActiva: true,
  };

  beforeEach(() => {
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      value: 580,
    });
    mockOnToggleBoleto.mockClear();
  });

  it('debería renderizar los boletos correctamente', () => {
    render(<SelectorBoletos {...baseProps} />);
    expect(screen.getByRole('button', { name: '00' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '50' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '99' })).toBeInTheDocument();
  });

  it('debería aplicar el estilo de "seleccionado" a los boletos correctos', () => {
    render(<SelectorBoletos {...baseProps} />);
    const boletoSeleccionado = screen.getByRole('button', { name: '05' });
    expect(boletoSeleccionado).toHaveClass('bg-green-500');
  });

  it('debería aplicar el estilo de "comprado" y deshabilitar el boleto', () => {
    render(<SelectorBoletos {...baseProps} />);
    const boletoComprado = screen.getByRole('button', { name: '10' });
    expect(boletoComprado).toHaveClass('bg-red-600');
    expect(boletoComprado).toBeDisabled();
  });

  it('debería aplicar el estilo de "conflicto" a los boletos correctos', () => {
    render(<SelectorBoletos {...baseProps} />);
    const boletoConflicto = screen.getByRole('button', { name: '99' });
    expect(boletoConflicto).toHaveClass('animate-pulse');
  });

  it('debería llamar a onToggleBoleto con el número correcto al hacer clic', async () => {
    const user = userEvent.setup();
    render(<SelectorBoletos {...baseProps} />);
    
    const boletoDisponible = screen.getByRole('button', { name: '08' });
    await user.click(boletoDisponible);

    expect(mockOnToggleBoleto).toHaveBeenCalledTimes(1);
    expect(mockOnToggleBoleto).toHaveBeenCalledWith(8);
  });

  it('debería ocultar los boletos ocupados cuando el filtro está activo', () => {
    const propsConFiltro = { ...baseProps, filtroActivo: true };
    render(<SelectorBoletos {...propsConFiltro} />);

    expect(screen.queryByRole('button', { name: '10' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '11' })).toBeInTheDocument();
  });
});