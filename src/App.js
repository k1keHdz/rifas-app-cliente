// src/App.js

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Contextos
import { RifasProvider } from "./context/RifasContext";
import { AuthProvider } from "./context/AuthContext";

// Componentes y Páginas
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Registro from "./components/Registro";
import RifasPublic from "./components/RifasPublic";
import RifaDetalle from "./components/RifaDetalle";
import RifaDetalleAdmin from "./components/RifaDetalleAdmin";
import RutaProtegida from "./components/RutaProtegida";
import CompletarPerfil from "./components/CompletarPerfil";
import AdminDashboard from "./components/AdminDashboard";
import MiPerfil from "./components/MiPerfil";
import SeleccionarRifaHistorial from "./components/SeleccionarRifaHistorial";
import GestionarRifasPage from "./pages/admin/GestionarRifasPage";
import Home from "./pages/Home";
import VerificadorBoletosPage from "./pages/VerificadorBoletosPage";


function App() {
  return (
    <AuthProvider>
      <RifasProvider>
        <Router>
          <Navbar />
          <main>
            <Routes>
              {/* --- Rutas Públicas --- */}
              <Route path="/" element={<Home />} />
              <Route path="/rifas" element={<RifasPublic />} />
              <Route path="/rifas/:id" element={<RifaDetalle />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Registro />} />
              <Route path="/verificador" element={<VerificadorBoletosPage />} />

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