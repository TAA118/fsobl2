import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

function DashboardLayout() {
  const { plan, role } = useSelector((state) => state.auth)
  const isAdmin = role === 'admin'
  const isPremium = plan === 'premium'

  const navigate = useNavigate()

  return (
    <section className="dashboard">
      <div className="register-card dashboard-panel">

        <div className="register-header">
          <h1>Dashboard</h1>
          <p>Selecciona una acción</p>
        </div>

        <div className="dashboard-actions">

          <button onClick={() => navigate('mis-criticas')}>
            Mis críticas
          </button>

          <button onClick={() => navigate('agregar-critica')}>
            Agregar crítica
          </button>

          <button onClick={() => navigate('criticas-libro')}>
            Buscar críticas por libro
          </button>

          <button onClick={() => navigate('informe-uso')}>
            Informe de uso
          </button>

          <button onClick={() => navigate('eventos')}>
            Eventos
          </button>

          {isAdmin && (
            <button onClick={() => navigate('admin/libros')}>
              Administrar libros
            </button>
          )}

          {isAdmin && (
            <button onClick={() => navigate('admin/generos')}>
              Administrar géneros
            </button>
          )}

          <button
            disabled={isPremium}
            onClick={() => navigate('cambio-plan')}
          >
            {isPremium ? 'Usuario Premium' : 'Cambio de plan'}
          </button>

        </div>

        {/* ACA SE RENDERIZA LA VISTA ACTIVA */}
        <div className="dashboard-content">
          <Outlet />
        </div>

      </div>
    </section>
  )
}

export default DashboardLayout