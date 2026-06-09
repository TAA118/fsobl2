import { useState } from 'react'
import { useSelector } from 'react-redux'
import ReactPaginate from 'react-paginate'
import { API_URL } from './config.js'

function EventosTicketmaster({ setError, setMessage }) {
  const { token } = useSelector((state) => state.auth)

  const [ciudad, setCiudad] = useState('')
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(false)

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [ciudadBuscada, setCiudadBuscada] = useState('')

  // -------------------------
  // helper seguro anti crash React #130
  // -------------------------
  const text = (v) => {
    if (!v) return ''
    if (typeof v === 'string' || typeof v === 'number') return String(v)
    return ''
  }

  // -------------------------
  // buscar eventos
  // -------------------------
  const buscar = async (e) => {
    e.preventDefault()

    if (!ciudad.trim()) {
      setError('Ingresa una ciudad')
      return
    }

    if (!token) {
      setError('Debes iniciar sesión')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setMessage(null)

      const res = await fetch(
        `${API_URL}/v1/ciudad/${ciudad}?page=1&limit=5`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Error buscando eventos')
      }

      setEventos(data.eventos || [])
      setTotalPages(data.totalPages || 1)
      setPage(1)
      setCiudadBuscada(data.ciudad || ciudad)

      setMessage(`Se encontraron ${data.total || 0} eventos`)
    } catch (err) {
      setError(err.message)
      setEventos([])
    } finally {
      setLoading(false)
    }
  }

  // -------------------------
  // paginación
  // -------------------------
  const cambiarPagina = async (newPage) => {
    if (!token) return

    try {
      setLoading(true)

      const res = await fetch(
        `${API_URL}/v1/ciudad/${ciudadBuscada}?page=${newPage}&limit=5`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Error en paginación')
      }

      setEventos(data.eventos || [])
      setPage(newPage)
      window.scrollTo(0, 0)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard-results">

      <h2>Eventos Ticketmaster</h2>

      {/* FORM */}
      <form onSubmit={buscar} className="register-form">
        <input
          value={ciudad}
          onChange={(e) => setCiudad(e.target.value)}
          placeholder="Ciudad..."
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {/* LISTA */}
      {eventos.length > 0 && (
        <>
          <p>
            <strong>Ciudad:</strong> {ciudadBuscada}
          </p>

          <ul className="dashboard-list">
            {eventos.map((ev) => (
              <li key={ev.id} className="dashboard-item">

                <strong>{text(ev.nombre)}</strong>

                <p>Lugar: {text(ev.venue)}</p>

                <p>
                  Fecha:{' '}
                  {ev.fecha_inicio
                    ? new Date(ev.fecha_inicio).toLocaleString()
                    : 'No disponible'}
                </p>

                <p>{text(ev.descripcion)}</p>

                <a
                  href={ev.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn--primary"
                >
                  Ver evento
                </a>
              </li>
            ))}
          </ul>

          {/* PAGINACION */}
          {totalPages > 1 && (
            <ReactPaginate
              pageCount={totalPages}
              onPageChange={(e) => cambiarPagina(e.selected + 1)}
              forcePage={page - 1}
              containerClassName="pagination"
              activeClassName="active"
            />
          )}
        </>
      )}

      {/* EMPTY */}
      {!loading && eventos.length === 0 && ciudadBuscada && (
        <p>No hay eventos para {ciudadBuscada}</p>
      )}

    </div>
  )
}

export default EventosTicketmaster