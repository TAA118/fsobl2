import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './Layout'
import Login from './Login'
import Register from './Register'
import DashboardLayout from './DashboardLayout'
import DashboardHome from './DashboardHome'
import MisCriticas from './MisCriticas'
import LibrosAdmin from './LibrosAdmin'
import GenerosAdmin from './GenerosAdmin'
import EventosTicketmaster from './EventosTicketmaster'
import CambioPlan from './CambioPlan'
import InformeUso from './InformeUso'
import CriticasPorLibro from './CriticasPorLibro'
import AgregarCritica from './AgregarCritica'
import Welcome from './Welcome'
import RutaNoEncontrada from './RutaNoEncontrada'

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/" element={<Layout />}>
          <Route index element={<Welcome />} />

          {/* DASHBOARD CON ROUTER INTERNO */}
          <Route path="dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />

            <Route path="mis-criticas" element={<MisCriticas />} />
            <Route path="agregar-critica" element={<AgregarCritica />} />
            <Route path="criticas-libro" element={<CriticasPorLibro />} />
            <Route path="informe-uso" element={<InformeUso />} />
            <Route path="eventos" element={<EventosTicketmaster />} />

            <Route path="admin/libros" element={<LibrosAdmin />} />
            <Route path="admin/generos" element={<GenerosAdmin />} />

            <Route path="cambio-plan" element={<CambioPlan />} />
          </Route>

        </Route>

        <Route path="*" element={<RutaNoEncontrada />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App