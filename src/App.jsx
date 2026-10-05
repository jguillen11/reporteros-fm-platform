import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import InfoPage from "./pages/InfoPage";
import MunicipiosPage from "./pages/MunicipiosPage";
import EstadosPage from "./pages/EstadosPage";
import PoliciacasPage from "./pages/PoliciacasPage";
import EspectaculosPage from "./pages/EspectaculosPage";
import NoticiasDeportes from "./pages/DeportesPage";
import FinanzasPage from "./pages/FinanzasPage";
import SurSurestePage from "./pages/SurSurestePage";
import NacionalesPage from "./pages/NacionalesPage";
import CulturaPage from "./pages/CulturaPage";
import TonilaJaliscoPage from "./pages/TonilaJaliscoPage";

// Rutas de Administración
import LoginPage from "./pages/admin/LoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage"; // Nueva importación
import CreateNewsPage from "./pages/admin/CreateNewsPage";        // Nueva importación
import EditNewsPage from "./pages/admin/EditNewsPage";            // Nueva importación

// Componente para proteger las rutas
import PrivateRoute from "./components/PrivateRoute";

function App() {
    return (
        <Routes>
            {/* PÚBLICAS */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/info" element={<InfoPage />} />
            <Route path="/municipios" element={<MunicipiosPage />} />
            <Route path="/estados" element={<EstadosPage />} />
            <Route path="/policiacas" element={<PoliciacasPage />} />
            <Route path="/espectaculos" element={<EspectaculosPage />} />
            <Route path="/deportes" element={<NoticiasDeportes />} />
            <Route path="/finanzas" element={<FinanzasPage />} />
            <Route path="/sur-sureste" element={<SurSurestePage />} />
            <Route path="/nacionales" element={<NacionalesPage />} />
            <Route path="/cultura" element={<CulturaPage />} />
            <Route path="/tonila" element={<TonilaJaliscoPage />} />

            {/* LOGIN */}
            <Route path="/admin/login" element={<LoginPage />} />
            
            {/* RUTAS PRIVADAS (ADMIN) */}
            <Route element={<PrivateRoute />}>
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="/admin/create" element={<CreateNewsPage />} />
                <Route path="/admin/edit/:id" element={<EditNewsPage />} />
            </Route>

        </Routes>
    );
}

export default App;