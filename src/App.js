import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { RifasProvider } from "./context/RifasContext";
import { AuthProvider } from "./context/AuthContext";
import { ConfigProvider, useConfig } from "./context/ConfigContext";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import RutaProtegida from "./components/RutaProtegida";
import Home from "./pages/Home";
import VerificadorBoletosPage from "./pages/VerificadorBoletosPage";
import ComoParticiparPage from "./pages/ComoParticiparPage";
import GanadoresPage from "./pages/GanadoresPage";
import ContactoPage from "./pages/ContactoPage";
import NosotrosPage from "./pages/NosotrosPage";
import TransparenciaPage from "./pages/TransparenciaPage";
import RifaDetallePage from "./pages/RifaDetallePage";
import LoginPage from "./pages/LoginPage";
import RegistroPage from "./pages/RegistroPage";
import CompletarPerfilPage from "./pages/CompletarPerfilPage";
import MiPerfilPage from "./pages/MiPerfilPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import ClientesPage from "./pages/admin/ClientesPage";
import ConfiguracionPage from "./pages/admin/ConfiguracionPage";
import GestionarGanadoresPage from "./pages/admin/GestionarGanadoresPage";
import GestionarRifasPage from "./pages/admin/GestionarRifasPage";
import RifaDetalleAdminPage from "./pages/admin/RifaDetalleAdminPage";
import SeleccionarRifaHistorialPage from "./pages/admin/SeleccionarRifaHistorialPage";

function AppRoutes() {
    const { config, cargandoConfig } = useConfig();

    if (cargandoConfig) {
        return <div className="text-center p-20">Cargando configuración...</div>;
    }

    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/rifa/:id" element={<RifaDetallePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegistroPage />} />
            <Route path="/verificador" element={<VerificadorBoletosPage />} />
            <Route path="/como-participar" element={<ComoParticiparPage />} />
            <Route path="/contacto" element={<ContactoPage />} />
            <Route path="/nosotros" element={<NosotrosPage />} />
            <Route path="/transparencia" element={<TransparenciaPage />} />
            {config?.showGanadoresPage && (
                <Route path="/ganadores" element={<GanadoresPage />} />
            )}
            <Route path="/completar-perfil" element={<RutaProtegida><CompletarPerfilPage /></RutaProtegida>} />
            <Route path="/perfil" element={<RutaProtegida><MiPerfilPage /></RutaProtegida>} />
            <Route path="/admin" element={<RutaProtegida rolRequerido="admin"><AdminDashboardPage /></RutaProtegida>} />
            <Route path="/admin/gestionar-rifas" element={<RutaProtegida rolRequerido="admin"><GestionarRifasPage /></RutaProtegida>} />
            <Route path="/admin/historial-ventas" element={<RutaProtegida rolRequerido="admin"><SeleccionarRifaHistorialPage /></RutaProtegida>} />
            <Route path="/admin/historial-ventas/:id" element={<RutaProtegida rolRequerido="admin"><RifaDetalleAdminPage /></RutaProtegida>} />
            <Route path="/admin/clientes" element={<RutaProtegida rolRequerido="admin"><ClientesPage /></RutaProtegida>} />
            <Route path="/admin/configuracion" element={<RutaProtegida rolRequerido="admin"><ConfiguracionPage /></RutaProtegida>} />
            <Route path="/admin/ganadores" element={<RutaProtegida rolRequerido="admin"><GestionarGanadoresPage /></RutaProtegida>} />
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <ConfigProvider>
                <RifasProvider>
                    <Router>
                        <Navbar />
                        <main>
                            <AppRoutes />
                        </main>
                        <Footer />
                    </Router>
                </RifasProvider>
            </ConfigProvider>
        </AuthProvider>
    );
}

export default App;