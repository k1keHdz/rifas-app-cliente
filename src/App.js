// src/App.js

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Contextos
import { RifasProvider, useRifas } from "./context/RifasContext";
// CAMBIO: LÍNEA DE IMPORTACIÓN RESTAURADA
import { AuthProvider } from "./context/AuthContext";

// Componentes Principales
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Registro from "./components/Registro";
import RifasPublic from "./components/RifasPublic";
import RifaDetalle from "./components/RifaDetalle";
import RifaDetalleAdmin from "./components/RifaDetalleAdmin";
import RifaForm from "./components/RifaForm";
import RifasList from "./components/RifasList";
import RutaProtegida from "./components/RutaProtegida";
import CompletarPerfil from "./components/CompletarPerfil";
import AdminDashboard from "./components/AdminDashboard";
import MiPerfil from "./components/MiPerfil";
import SeleccionarRifaHistorial from "./components/SeleccionarRifaHistorial";

const GestionarRifasPage = () => {
  const { isFormVisible, iniciarCreacionRifa } = useRifas();
  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Rifas</h1>
        {!isFormVisible && (
          <button 
            onClick={iniciarCreacionRifa} 
            className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors shadow-md"
          >
            + Crear Nueva Rifa
          </button>
        )}
      </div>
      {isFormVisible && <RifaForm />}
      <RifasList />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <RifasProvider>
        <Router>
          <Navbar />
          <main>
            <Routes>
              {/* --- Rutas Públicas --- */}
              <Route path="/" element={<RifasPublic />} />
              <Route path="/rifas" element={<RifasPublic />} />
              <Route path="/rifas/:id" element={<RifaDetalle />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Registro />} />

              {/* --- Rutas Protegidas --- */}
              <Route path="/admin" element={<RutaProtegida rolRequerido="admin"><AdminDashboard /></RutaProtegida>} />
              <Route path="/admin/gestionar-rifas" element={<RutaProtegida rolRequerido="admin"><GestionarRifasPage /></RutaProtegida>} />
              <Route path="/admin/historial-ventas" element={<RutaProtegida rolRequerido="admin"><SeleccionarRifaHistorial /></RutaProtegida>} />
              <Route path="/admin/rifa/:id" element={<RutaProtegida rolRequerido="admin"><RifaDetalleAdmin /></RutaProtegida>} />
              
              <Route path="/completar-perfil" element={<RutaProtegida><CompletarPerfil /></RutaProtegida>} />
              <Route path="/perfil" element={<RutaProtegida><MiPerfil /></RutaProtegida>} />
            </Routes>
          </main>
        </Router>
      </RifasProvider>
    </AuthProvider>
  );
}

export default App;