import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { RifasProvider } from "./context/RifasContext";
import { AuthProvider } from "./context/AuthContext";
import { ConfigProvider, useConfig } from "./context/ConfigContext"; 

// --- Componentes y Páginas (Rutas de importación actualizadas) ---

// Componentes de Layout y Lógica
import Navbar from "./components/layout/Navbar"; // CORREGIDO
import Footer from "./components/layout/Footer"; // CORREGIDO
import RutaProtegida from "./components/RutaProtegida"; // Se mantiene (no se movió)

// Páginas Públicas
import Home from "./pages/Home";
import VerificadorBoletosPage from "./pages/VerificadorBoletosPage";
import ComoParticiparPage from "./pages/ComoParticiparPage";
import GanadoresPage from "./pages/GanadoresPage";
import ContactoPage from "./pages/ContactoPage";
import NosotrosPage from "./pages/NosotrosPage";
import TransparenciaPage from "./pages/TransparenciaPage";
import RifaDetallePage from "./pages/RifaDetallePage"; // CORREGIDO

// Páginas de Usuario y Autenticación
import LoginPage from "./pages/LoginPage"; // CORREGIDO
import RegistroPage from "./pages/RegistroPage"; // CORREGIDO
import CompletarPerfilPage from "./pages/CompletarPerfilPage"; // CORREGIDO
import MiPerfilPage from "./pages/MiPerfilPage"; // CORREGIDO

// Páginas de Administrador
import AdminDashboardPage from "./pages/admin/AdminDashboardPage"; // CORREGIDO
import ClientesPage from "./pages/admin/ClientesPage";
import ConfiguracionPage from "./pages/admin/ConfiguracionPage";
import GestionarGanadoresPage from "./pages/admin/GestionarGanadoresPage";
import GestionarRifasPage from "./pages/admin/GestionarRifasPage";
import RifaDetalleAdminPage from "./pages/admin/RifaDetalleAdminPage"; // CORREGIDO
import SeleccionarRifaHistorialPage from "./pages/admin/SeleccionarRifaHistorialPage"; // CORREGIDO


function AppRoutes() {
    const { config, cargandoConfig } = useConfig();
    if (cargandoConfig) {
        return <div className="text-center p-20">Cargando configuración...</div>;
    }
    return (
        <Routes>
            {/* Rutas Públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/rifa/:id" element={<RifaDetallePage />} /> {/* CORREGIDO */}
            <Route path="/login" element={<LoginPage />} /> {/* CORREGIDO */}
            <Route path="/registro" element={<RegistroPage />} /> {/* CORREGIDO */}
            <Route path="/verificador" element={<VerificadorBoletosPage />} />
            <Route path="/como-participar" element={<ComoParticiparPage />} />
            <Route path="/contacto" element={<ContactoPage />} />
            <Route path="/nosotros" element={<NosotrosPage />} />
            <Route path="/transparencia" element={<TransparenciaPage />} />
            {config?.showGanadoresPage && (
                <Route path="/ganadores" element={<GanadoresPage />} />
            )}

            {/* Rutas Protegidas de Usuario */}
            <Route path="/completar-perfil" element={<RutaProtegida><CompletarPerfilPage /></RutaProtegida>} /> {/* CORREGIDO */}
            <Route path="/perfil" element={<RutaProtegida><MiPerfilPage /></RutaProtegida>} /> {/* CORREGIDO */}

            {/* Rutas Protegidas de Administrador */}
            <Route path="/admin" element={<RutaProtegida rolRequerido="admin"><AdminDashboardPage /></RutaProtegida>} /> {/* CORREGIDO */}
            <Route path="/admin/gestionar-rifas" element={<RutaProtegida rolRequerido="admin"><GestionarRifasPage /></RutaProtegida>} />
            <Route path="/admin/historial-ventas" element={<RutaProtegida rolRequerido="admin"><SeleccionarRifaHistorialPage /></RutaProtegida>} /> {/* CORREGIDO */}
            <Route path="/admin/historial-ventas/:id" element={<RutaProtegida rolRequerido="admin"><RifaDetalleAdminPage /></RutaProtegida>} /> {/* CORREGIDO */}
            <Route path="/admin/clientes" element={<RutaProtegida rolRequerido="admin"><ClientesPage /></RutaProtegida>} />
            <Route path="/admin/configuracion" element={<RutaProtegida rolRequerido="admin"><ConfiguracionPage /></RutaProtegida>} />
            <Route path="/admin/ganadores" element={<RutaProtegida rolRequerido="admin"><GestionarGanadoresPage /></RutaProtegida>} />
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
