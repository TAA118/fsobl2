import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useSelector } from 'react-redux'
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

function PublicRoute({ children }) {
  const { token } = useSelector((state) => state.auth)
  return token ? <Navigate to="/dashboard" replace /> : children
}

function PrivateRoute({ children }) {
  const { token } = useSelector((state) => state.auth)
  return token ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { role } = useSelector((state) => state.auth)
  return role === 'admin' ? children : <Navigate to="/dashboard" replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* AUTH */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* LAYOUT PRINCIPAL */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Welcome />} />

          {/* DASHBOARD */}
          <Route path="dashboard" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>

            {/* HOME DEL DASHBOARD */}
            <Route index element={<DashboardHome />} />

            {/* USUARIO */}
            <Route path="mis-criticas" element={<MisCriticas />} />
            <Route path="agregar-critica" element={<AgregarCritica />} />
            <Route path="criticas-libro" element={<CriticasPorLibro />} />

            {/* INFO */}
            <Route path="informe-uso" element={<InformeUso />} />
            <Route path="eventos" element={<EventosTicketmaster />} />

            {/* ADMIN */}
            <Route path="admin/libros" element={<AdminRoute><LibrosAdmin /></AdminRoute>} />
            <Route path="admin/generos" element={<AdminRoute><GenerosAdmin /></AdminRoute>} />

            {/* PLAN */}
            <Route path="cambio-plan" element={<CambioPlan />} />

          </Route>

        </Route>

        {/* 404 */}
        <Route path="*" element={<RutaNoEncontrada />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
