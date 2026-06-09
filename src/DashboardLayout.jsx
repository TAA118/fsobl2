import { NavLink, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'

function DashboardLayout() {
  const { plan, role } = useSelector((state) => state.auth)
  const isAdmin = role === 'admin'
  const isPremium = plan === 'premium'

  return (
    <section className="dashboard">
      <div className="register-card dashboard-panel">

        <div className="register-header">
          <h1>Dashboard</h1>
          <p>Selecciona una acción</p>
        </div>

        <div className="dashboard-actions">

          <NavLink to="mis-criticas" className="btn">
            Mis críticas
          </NavLink>

          <NavLink to="agregar-critica" className="btn">
            Agregar crítica
          </NavLink>

          <NavLink to="criticas-libro" className="btn">
            Buscar críticas por libro
          </NavLink>

          <NavLink to="informe-uso" className="btn">
            Informe de uso
          </NavLink>

          <NavLink to="eventos" className="btn">
            Eventos
          </NavLink>

          {isAdmin && (
            <NavLink to="admin/libros" className="btn">
              Administrar libros
            </NavLink>
          )}

          {isAdmin && (
            <NavLink to="admin/generos" className="btn">
              Administrar géneros
            </NavLink>
          )}

          {isPremium ? (
            <span className="btn btn--disabled">Usuario Premium</span>
          ) : (
            <NavLink to="cambio-plan" className="btn">
              Cambio de plan
            </NavLink>
          )}

        </div>

        <div className="dashboard-content">
          <Outlet />
        </div>

      </div>
    </section>
  )
}

export default DashboardLayout
