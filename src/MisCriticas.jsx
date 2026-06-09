import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { API_URL } from './config.js'

import MisCriticas from './MisCriticas.jsx'
import LibrosAdmin from './LibrosAdmin.jsx'
import GenerosAdmin from './GenerosAdmin.jsx'
import EventosTicketmaster from './EventosTicketmaster.jsx'
import CambioPlan from './CambioPlan.jsx'
import InformeUso from './InformeUso.jsx'
import Paginate from './Paginate.jsx'

import { setPlan } from './store/authSlice.js'

function Dashboard() {
  const [view, setView] = useState('inicio')

  const [libros, setLibros] = useState([])
  const [informeUso, setInformeUso] = useState(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  const dispatch = useDispatch()
  const { token, plan: userPlan, role: userRole } = useSelector(
    (state) => state.auth
  )

  const authHeaders = token
    ? { Authorization: `Bearer ${token}` }
    : {}

  // 🧠 cargar plan
  useEffect(() => {
    const cached = localStorage.getItem('plan')
    if (cached) dispatch(setPlan(cached))
  }, [dispatch])

  const fetchLibros = async () => {
    try {
      setLoading(true)

      const res = await fetch(`${API_URL}/v1/libros`, {
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        }
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.message)

      setLibros(data.libros || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchInformeUso = async () => {
    try {
      setLoading(true)

      const res = await fetch(`${API_URL}/v1/criticas/informe/uso`, {
        headers: authHeaders
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.message)

      setInformeUso(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleViewChange = (nextView) => {
    setError(null)
    setMessage(null)
    setView(nextView)

    if (nextView === 'agregarCritica') fetchLibros()
    if (nextView === 'criticasLibro') fetchLibros()
    if (nextView === 'informeUso') fetchInformeUso()
  }

  const isAdmin = userRole === 'admin'
  const isPremium = userPlan === 'premium'

  return (
    <section className="dashboard">
      <div className="register-card dashboard-panel">

        {/* HEADER */}
        <div className="register-header">
          <h1>Dashboard</h1>
          <p>Selecciona una acción</p>
        </div>

        {/* BOTONES */}
        <div className="dashboard-actions">

          <button onClick={() => setView('misCriticas')}>
            Mis críticas
          </button>

          <button onClick={() => setView('agregarCritica')}>
            Agregar crítica
          </button>

          <button onClick={() => setView('criticasLibro')}>
            Buscar críticas por libro
          </button>

          <button onClick={() => setView('informeUso')}>
            Informe de uso
          </button>

          <button onClick={() => setView('eventos')}>
            Eventos
          </button>

          {isAdmin && (
            <button onClick={() => setView('adminLibros')}>
              Administrar libros
            </button>
          )}

          {isAdmin && (
            <button onClick={() => setView('adminGeneros')}>
              Administrar géneros
            </button>
          )}

          <button
            disabled={isPremium}
            onClick={() => setView('cambioPlan')}
          >
            Cambio de plan
          </button>
        </div>

        {/* ERRORES */}
        {error && <div className="alert error">{error}</div>}
        {message && <div className="alert success">{message}</div>}

        {/* VISTAS */}
        {view === 'inicio' && (
          <p>Elegí una opción del menú</p>
        )}

        {view === 'misCriticas' && (
          <MisCriticas
            authHeaders={authHeaders}
            loading={loading}
            setLoading={setLoading}
            setError={setError}
            setMessage={setMessage}
          />
        )}

        {view === 'agregarCritica' && (
          <p>Aquí irá AgregarCritica.jsx (luego lo separás)</p>
        )}

        {view === 'criticasLibro' && (
          <p>Aquí irá CriticasPorLibro.jsx</p>
        )}

        {view === 'informeUso' && informeUso && (
          <InformeUso informeUso={informeUso} />
        )}

        {view === 'eventos' && (
          <EventosTicketmaster
            loading={loading}
            setLoading={setLoading}
            setError={setError}
            setMessage={setMessage}
          />
        )}

        {view === 'adminLibros' && (
          <LibrosAdmin
            authHeaders={authHeaders}
            loading={loading}
            setLoading={setLoading}
            setError={setError}
            setMessage={setMessage}
            userRole={userRole}
          />
        )}

        {view === 'adminGeneros' && (
          <GenerosAdmin
            authHeaders={authHeaders}
            loading={loading}
            setLoading={setLoading}
            setError={setError}
            setMessage={setMessage}
            userRole={userRole}
          />
        )}

        {view === 'cambioPlan' && (
          <CambioPlan
            authHeaders={authHeaders}
            loading={loading}
            setLoading={setLoading}
            setError={setError}
            setMessage={setMessage}
          />
        )}

      </div>
    </section>
  )
}

export default Dashboard