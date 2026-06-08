import { Link } from 'react-router-dom'

function Welcome() {
  return (
    <section className="welcome-card">
      <div className="welcome-copy">
        <span className="badge">Bienvenido</span>
        <h1>Regístrate o inicia sesión</h1>
        <p>Usa la navegación para crear un usuario o iniciar sesión y acceder al dashboard.</p>
      </div>

      <div className="welcome-actions">
        <Link to="/register" className="btn btn--primary">
          Comenzar registro
        </Link>
        <Link to="/login" className="btn btn--secondary">
          Iniciar sesión
        </Link>
      </div>
    </section>
  )
}

export default Welcome
