import { useState } from 'react'
import { useSelector } from 'react-redux'
import { API_URL } from './config.js'
import Paginate from './Paginate.jsx'

function EventosTicketmaster({ loading, setLoading, setError, setMessage }) {
  const [ciudad, setCiudad] = useState('')
  const [eventos, setEventos] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [ciudadBuscada, setCiudadBuscada] = useState('')
  const [eventosLoading, setEventosLoading] = useState(false)

  const { token } = useSelector((state) => state.auth)

  const LIMIT = 5

  // 🔥 FIX CLAVE: evita React error #130
  const safeText = (v) => {
    if (!v) return ''
    if (typeof v === 'string') return v
    if (typeof v === 'number') return String(v)
    if (Array.isArray(v)) return v.join(', ')
    if (typeof v === 'object') return v.text || v.name || ''
    return ''
  }

  // -------------------------
  // buscar
  // -------------------------
  const fetchEventos = async (ciudadParam, pageParam = 1) => {
    if (!token) {
      setError('Debes iniciar sesión')
      return
    }

    setEventosLoading(true)
    setError(null)
    setMessage(null)

    try {
      const res = await fetch(
        `${API_URL}/v1/ciudad/${encodeURIComponent(ciudadParam)}?page=${pageParam}&limit=${LIMIT}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Error al buscar eventos')

      const normalized = (data.eventos || []).map((e) => ({
        id: e.id,
        nombre: safeText(e.nombre),
        descripcion: safeText(e.descripcion),
        venue: safeText(e.venue),
        imagen: e.imagen || null,
        url: e.url || '#',
        fecha_inicio: e.fecha_inicio || null
      }))

      setEventos(normalized)
      setTotalPages(data.totalPages || 1)
      setPage(pageParam)
      setCiudadBuscada(ciudadParam)

      setMessage(`Se encontraron ${data.total || 0} eventos en ${ciudadParam}`)
    } catch (err) {
      setError(err.message)
      setEventos([])
    } finally {
      setEventosLoading(false)
    }
  }

  // submit búsqueda
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!ciudad.trim()) {
      setError('Ingresa una ciudad')
      return
    }

    fetchEventos(ciudad, 1)
  }

  // paginación (TU componente)
  const handlePageChange = (newPage) => {
    fetchEventos(ciudadBuscada, newPage)
  }

  return (
    <div className="dashboard-results">

      <div className="register-header">
        <h2>Eventos</h2>
        <p>Busca eventos literarios por ciudad</p>
      </div>

      {/* FORM */}
      <form className="register-form" onSubmit={handleSubmit}>
        <label>
          Ciudad
          <input
            value={ciudad}
            onChange={(e) => setCiudad(e.target.value)}
            placeholder="Ej: Madrid, Buenos Aires..."
          />
        </label>

        <button
          className="btn btn--primary"
          disabled={eventosLoading || loading}
        >
          {eventosLoading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {/* LISTA */}
      {eventos.length > 0 && (
        <>
          <ul className="dashboard-list">
            {eventos.map((evento) => (
              <li key={evento.id} className="dashboard-item">

                {evento.imagen && (
                  <img
                    src={evento.imagen}
                    alt={evento.nombre}
                    style={{ maxWidth: '100%', marginBottom: '10px' }}
                  />
                )}

                <strong>{evento.nombre}</strong>

                <p>{evento.venue}</p>

                <p>
                  {evento.fecha_inicio
                    ? new Date(evento.fecha_inicio).toLocaleString()
                    : 'Sin fecha'}
                </p>

                <p>{evento.descripcion}</p>

                <a
                  href={evento.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--secondary"
                >
                  Ver detalles
                </a>
              </li>
            ))}
          </ul>

          {/* TU PAGINATE */}
          {totalPages > 1 && (
            <Paginate
              pageCount={totalPages}
              currentPage={page}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {/* EMPTY */}
      {!eventosLoading && eventos.length === 0 && ciudadBuscada && (
        <p>No se encontraron eventos para {ciudadBuscada}</p>
      )}
    </div>
  )
}

export default EventosTicketmaster