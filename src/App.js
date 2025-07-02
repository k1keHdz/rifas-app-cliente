import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { RifasProvider } from "./context/RifasContext";
import { AuthProvider } from "./context/AuthContext";
import { ConfigProvider, useConfig } from "./context/ConfigContext"; 

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
import ClientesPage from "./pages/admin/ClientesPage";
import ConfiguracionPage from "./pages/admin/ConfiguracionPage";
import NosotrosPage from "./pages/NosotrosPage";
import TransparenciaPage from "./pages/TransparenciaPage";

function AppRoutes() {
    const { config, cargandoConfig } = useConfig();
    if (cargandoConfig) {
        return <div className="text-center p-20">Cargando configuración...</div>;
    }
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/rifa/:id" element={<RifaDetalle />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/verificador" element={<VerificadorBoletosPage />} />
            <Route path="/como-participar" element={<ComoParticiparPage />} />
            <Route path="/contacto" element={<ContactoPage />} />
            {config?.showGanadoresPage && (
                <Route path="/ganadores" element={<GanadoresPage />} />
            )}
            <Route path="/admin" element={<RutaProtegida rolRequerido="admin"><AdminDashboard /></RutaProtegida>} />
            <Route path="/admin/gestionar-rifas" element={<RutaProtegida rolRequerido="admin"><GestionarRifasPage /></RutaProtegida>} />
            <Route path="/admin/historial-ventas" element={<RutaProtegida rolRequerido="admin"><SeleccionarRifaHistorial /></RutaProtegida>} />
            
            {/* --- RUTA CORREGIDA --- */}
            {/* Esta es la ruta correcta y única para ver el detalle de un sorteo como admin */}
            <Route path="/admin/historial-ventas/:id" element={<RutaProtegida rolRequerido="admin"><RifaDetalleAdmin /></RutaProtegida>} />
            
            <Route path="/admin/clientes" element={<RutaProtegida rolRequerido="admin"><ClientesPage /></RutaProtegida>} />
            <Route path="/admin/configuracion" element={<RutaProtegida rolRequerido="admin"><ConfiguracionPage /></RutaProtegida>} />
            <Route path="/admin/ganadores" element={<RutaProtegida rolRequerido="admin"><GestionarGanadoresPage /></RutaProtegida>} />
            <Route path="/completar-perfil" element={<RutaProtegida><CompletarPerfil /></RutaProtegida>} />
            <Route path="/perfil" element={<RutaProtegida><MiPerfil /></RutaProtegida>} />
            <Route path="/nosotros" element={<NosotrosPage />} />
            <Route path="/transparencia" element={<TransparenciaPage />} />
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <RifasProvider>
                <ConfigProvider>
                    <Router>
                        <Navbar />
                        <main>
                            <AppRoutes />
                        </main>
                        <Footer />
                    </Router>
                </ConfigProvider>
            </RifasProvider>
        </AuthProvider>
    );
}

export default App;
