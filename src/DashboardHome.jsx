import { Link } from 'react-router-dom'

function DashboardHome() {
  return (
    <div className="dashboard-results">
      <h2>Elige una opción</h2>
      <p>Usa el menú para navegar o empieza creando una crítica.</p>
      <div className="dashboard-actions">
        <Link to="agregar-critica" className="btn btn--primary">
          Agregar crítica
        </Link>
        <Link to="mis-criticas" className="btn btn--secondary">
          Ver mis críticas
        </Link>
      </div>
    </div>
  )
}

export default DashboardHome
