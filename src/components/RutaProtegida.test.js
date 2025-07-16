import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom';

// 1. Importamos el componente a probar y el hook que vamos a falsear
import RutaProtegida from './RutaProtegida';
import { useAuth } from '../context/AuthContext';

// 2. Mockeamos el hook useAuth. Jest se encargará de que nuestro componente
// use esta versión falsa en lugar de la real.
jest.mock('../context/AuthContext');


// 3. Creamos componentes falsos para simular las páginas a las que se redirige
const PaginaDeLogin = () => <div>Estás en la página de Login</div>;
const PaginaDeInicio = () => <div>Estás en la página de Inicio</div>;
const ContenidoProtegido = () => <div>Contenido Secreto</div>;
const ContenidoAdmin = () => <div>Panel de Administrador</div>;


// 4. Función de ayuda para renderizar nuestro componente en un entorno de rutas completo
const renderWithRouter = (ui, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);

  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/login" element={<PaginaDeLogin />} />
        <Route path="/" element={<PaginaDeInicio />} />
        <Route path="/secreto" element={<RutaProtegida>{ui}</RutaProtegida>} />
        <Route path="/admin" element={<RutaProtegida rolRequerido="admin">{ui}</RutaProtegida>} />
      </Routes>
    </MemoryRouter>
  );
};


describe('RutaProtegida', () => {
  it('debería mostrar el mensaje de carga cuando la autenticación está en proceso', () => {
    // Simulamos el estado de carga
    useAuth.mockReturnValue({
      cargandoAuth: true,
      currentUser: null,
      userData: null,
    });
    renderWithRouter(<ContenidoProtegido />, { route: '/secreto' });
    expect(screen.getByText('Verificando acceso...')).toBeInTheDocument();
  });

  it('debería redirigir a /login si el usuario no está autenticado', () => {
    // Simulamos un usuario no logueado
    useAuth.mockReturnValue({
      cargandoAuth: false,
      currentUser: null,
      userData: null,
    });
    renderWithRouter(<ContenidoProtegido />, { route: '/secreto' });
    expect(screen.getByText('Estás en la página de Login')).toBeInTheDocument();
  });

  it('debería mostrar el contenido si el usuario está autenticado y no se requiere rol', () => {
    // Simulamos un usuario normal logueado
    useAuth.mockReturnValue({
      cargandoAuth: false,
      currentUser: { uid: 'user123' },
      userData: { rol: 'usuario' },
    });
    renderWithRouter(<ContenidoProtegido />, { route: '/secreto' });
    expect(screen.getByText('Contenido Secreto')).toBeInTheDocument();
  });

  it('debería mostrar el contenido de admin si el usuario es admin', () => {
    // Simulamos un usuario admin
    useAuth.mockReturnValue({
      cargandoAuth: false,
      currentUser: { uid: 'admin123' },
      userData: { rol: 'admin' },
    });
    renderWithRouter(<ContenidoAdmin />, { route: '/admin' });
    expect(screen.getByText('Panel de Administrador')).toBeInTheDocument();
  });

  it('debería redirigir a la página de inicio si un usuario normal intenta acceder a una ruta de admin', () => {
    // Simulamos un usuario normal intentando ser admin
    useAuth.mockReturnValue({
      cargandoAuth: false,
      currentUser: { uid: 'user123' },
      userData: { rol: 'usuario' },
    });
    renderWithRouter(<ContenidoAdmin />, { route: '/admin' });
    expect(screen.getByText('Estás en la página de Inicio')).toBeInTheDocument();
  });
});