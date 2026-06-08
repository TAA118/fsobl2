import { Link } from 'react-router-dom'

function RutaNoEncontrada() {
  return (
    <section className="register-card">
      <div className="register-header">
        <h1>Página no encontrada</h1>
        <p>La ruta que buscas no existe. Regresa al inicio o intenta otra opción.</p>
      </div>

      <Link to="/" className="btn btn--primary">
        Volver al inicio
      </Link>
    </section>
  )
}

export default RutaNoEncontrada
