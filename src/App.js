// src/App.js

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NosotrosPage from "./pages/NosotrosPage";
import TransparenciaPage from "./pages/TransparenciaPage";
import { RifasProvider } from "./context/RifasContext";
import { AuthProvider } from "./context/AuthContext";
import { FEATURES } from './config/features';


// Componentes y Páginas
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Login from "./components/Login";
import Registro from "./components/Registro";
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
import ComoParticiparPage from "./pages/ComoParticiparPage";
import GestionarGanadoresPage from "./pages/admin/GestionarGanadoresPage";
import GanadoresPage from "./pages/GanadoresPage";
import ContactoPage from "./pages/ContactoPage";


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
              <Route path="/rifa/:id" element={<RifaDetalle />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Registro />} />
              <Route path="/verificador" element={<VerificadorBoletosPage />} />
              <Route path="/como-participar" element={<ComoParticiparPage />} />
              <Route path="/contacto" element={<ContactoPage />} />

              {FEATURES.showGanadoresPage && (
                <Route path="/ganadores" element={<GanadoresPage />} />
              )}

              {/* --- Rutas Protegidas --- */}
              <Route path="/admin" element={<RutaProtegida rolRequerido="admin"><AdminDashboard /></RutaProtegida>} />
              <Route path="/admin/gestionar-rifas" element={<RutaProtegida rolRequerido="admin"><GestionarRifasPage /></RutaProtegida>} />
              <Route path="/admin/historial-ventas" element={<RutaProtegida rolRequerido="admin"><SeleccionarRifaHistorial /></RutaProtegida>} />
              <Route path="/admin/rifa/:id" element={<RutaProtegida rolRequerido="admin"><RifaDetalleAdmin /></RutaProtegida>} />
              <Route path="/admin/ganadores" element={<RutaProtegida rolRequerido="admin"><GestionarGanadoresPage /></RutaProtegida>} />
              <Route path="/completar-perfil" element={<RutaProtegida><CompletarPerfil /></RutaProtegida>} />
              <Route path="/perfil" element={<RutaProtegida><MiPerfil /></RutaProtegida>} />
              <Route path="/nosotros" element={<NosotrosPage />} />
              <Route path="/transparencia" element={<TransparenciaPage />} />
            </Routes>
          </main>
          <Footer />
        </Router>
      </RifasProvider>
    </AuthProvider>
  );
}

export default App;
