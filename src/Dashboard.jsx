import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { API_URL } from './config.js'
import MisCriticas from './MisCriticas.jsx'
import LibrosAdmin from './LibrosAdmin.jsx'
import GenerosAdmin from './GenerosAdmin.jsx'
import EventosTicketmaster from './EventosTicketmaster.jsx'
import CambioPlan from './CambioPlan.jsx'
import InformeUso from './InformeUso.jsx'
import CriticasPorLibro from './CriticasPorLibro.jsx'
import AgregarCritica from './AgregarCritica.jsx'
import { setPlan } from './store/authSlice.js'

function Dashboard() {
  const [view, setView] = useState('inicio')
  const [libros, setLibros] = useState([])
  const [informeUso, setInformeUso] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const dispatch = useDispatch()
  const { token, plan: userPlan, role: userRole } = useSelector((state) => state.auth)
  const authHeaders = token? { Authorization: `Bearer ${token}` }: {}

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

        <div className="register-header">
          <h1>Dashboard</h1>
          <p>Selecciona una acción</p>
        </div>

        <div className="dashboard-actions">

          <button
            className="btn btn--primary"
            onClick={() => setView('misCriticas')}
            disabled={loading}
          >
            Mis críticas
          </button>

          <button
            className="btn btn--secondary"
            onClick={() => handleViewChange('agregarCritica')}
            disabled={loading}
          >
            Agregar crítica
          </button>

          <button
            className="btn btn--secondary"
            onClick={() => handleViewChange('criticasLibro')}
            disabled={loading}
          >
            Buscar críticas por libro
          </button>

          <button
            className="btn btn--secondary"
            onClick={() => handleViewChange('informeUso')}
            disabled={loading}
          >
            Informe de uso
          </button>

          <button
            className="btn btn--secondary"
            onClick={() => handleViewChange('eventos')}
            disabled={loading}
          >
            Eventos
          </button>

          {isAdmin && (
            <button
              className="btn btn--secondary"
              onClick={() => setView('adminLibros')}
              disabled={loading}
            >
              Administrar libros
            </button>
          )}

          {isAdmin && (
            <button
              className="btn btn--secondary"
              onClick={() => setView('adminGeneros')}
              disabled={loading}
            >
              Administrar géneros
            </button>
          )}

          <button
            className={`btn btn--primary ${isPremium ? 'btn--disabled' : ''}`}
            onClick={() => setView('cambioPlan')}
            disabled={loading || isPremium}
          >
            {isPremium ? 'Usuario Premium' : 'Cambio de plan'}
          </button>

        </div>

        {error && <div className="alert error">{error}</div>}
        {message && <div className="alert success">{message}</div>}

        {view === 'inicio' && (
          <div className="dashboard-results">
            <h2>Elige una opción</h2>
            <p>Usa el menú superior para navegar</p>
          </div>
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
          <AgregarCritica
            authHeaders={authHeaders}
            loading={loading}
            setLoading={setLoading}
            setError={setError}
            setMessage={setMessage}
          />
        )}

        {view === 'criticasLibro' && (
            <CriticasPorLibro
              authHeaders={authHeaders}
              loading={loading}
              setLoading={setLoading}
              setError={setError}
            />
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