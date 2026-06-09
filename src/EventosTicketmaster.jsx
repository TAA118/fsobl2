import { useState } from 'react'
import { useSelector } from 'react-redux'
import ReactPaginate from 'react-paginate'
import { API_URL } from './config.js'

function EventosTicketmaster({ loading, setLoading, setError, setMessage }) {
  const [ciudad, setCiudad] = useState('')
  const [eventos, setEventos] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [ciudadBuscada, setCiudadBuscada] = useState('')
  const [eventosLoading, setEventosLoading] = useState(false)

  const { token } = useSelector((state) => state.auth)

  // -------------------------
  // helper anti error #130
  // -------------------------
  const safeText = (v) =>
    typeof v === 'object' ? v?.text || v?.value || '' : v || ''

  // -------------------------
  // buscar eventos
  // -------------------------
  const handleBuscarEventos = async (e) => {
    e.preventDefault()

    if (!ciudad.trim()) {
      setError('Por favor ingresa una ciudad')
      return
    }

    if (!token) {
      setError('Debes iniciar sesión')
      return
    }

    setEventosLoading(true)
    setError(null)
    setMessage(null)

    try {
      const res = await fetch(
        `${API_URL}/v1/ciudad/${encodeURIComponent(ciudad)}?page=1&limit=5`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Error al buscar eventos')

      const eventosNormalizados = (data.eventos || []).map((e) => ({
        id: e.id,
        nombre: safeText(e.nombre),
        venue: safeText(e.venue),
        descripcion: safeText(e.descripcion),
        fecha_inicio: e.fecha_inicio || null,
        imagen: e.imagen || null,
        url: e.url || '#'
      }))

      setEventos(eventosNormalizados)
      setTotalPages(data.totalPages || 1)
      setCurrentPage(1)
      setCiudadBuscada(data.ciudad || ciudad)

      setMessage(
        `Se encontraron ${data.total || 0} eventos en ${data.ciudad || ciudad}`
      )
    } catch (err) {
      setError(err.message)
      setEventos([])
    } finally {
      setEventosLoading(false)
    }
  }

  // -------------------------
  // paginación
  // -------------------------
  const handlePaginacion = async (page) => {
    if (!token) return

    setEventosLoading(true)

    try {
      const res = await fetch(
        `${API_URL}/v1/ciudad/${encodeURIComponent(
          ciudadBuscada
        )}?page=${page}&limit=5`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Error al paginar')

      const eventosNormalizados = (data.eventos || []).map((e) => ({
        id: e.id,
        nombre: safeText(e.nombre),
        venue: safeText(e.venue),
        descripcion: safeText(e.descripcion),
        fecha_inicio: e.fecha_inicio || null,
        imagen: e.imagen || null,
        url: e.url || '#'
      }))

      setEventos(eventosNormalizados)
      setCurrentPage(page)

      window.scrollTo(0, 0)
    } catch (err) {
      setError(err.message)
    } finally {
      setEventosLoading(false)
    }
  }

  const handlePageChange = (e) => {
    handlePaginacion(e.selected + 1)
  }

  return (
    <div className="dashboard-results">

      <div className="register-header">
        <h2>Eventos literarios</h2>
        <p>Busca eventos por ciudad</p>
      </div>

      {/* FORM */}
      <form className="register-form" onSubmit={handleBuscarEventos}>
        <label>
          Ciudad
          <input
            value={ciudad}
            onChange={(e) => setCiudad(e.target.value)}
            placeholder="Ej: Madrid, Buenos Aires..."
            required
          />
        </label>

        <button
          type="submit"
          className="btn btn--primary"
          disabled={eventosLoading || loading}
        >
          {eventosLoading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {/* INFO */}
      {eventos.length > 0 && (
        <>
          <div className="eventos-info">
            <p>
              <strong>Ciudad:</strong> {ciudadBuscada}
            </p>
            <p>
              <strong>Página:</strong> {currentPage} / {totalPages}
            </p>
          </div>

          {/* LISTA */}
          <ul className="dashboard-list">
            {eventos.map((evento) => (
              <li key={evento.id} className="dashboard-item">

                {evento.imagen && (
                  <img
                    src={evento.imagen}
                    alt={evento.nombre}
                    style={{
                      width: '100%',
                      maxHeight: '200px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      marginBottom: '10px'
                    }}
                  />
                )}

                <strong>{evento.nombre}</strong>

                <p>
                  <strong>Lugar:</strong> {evento.venue}
                </p>

                <p>
                  <strong>Fecha:</strong>{' '}
                  {evento.fecha_inicio
                    ? new Date(evento.fecha_inicio).toLocaleString('es-ES')
                    : 'No disponible'}
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

          {/* PAGINACION */}
          {totalPages > 1 && (
            <ReactPaginate
              previousLabel="←"
              nextLabel="→"
              pageCount={totalPages}
              onPageChange={handlePageChange}
              forcePage={currentPage - 1}
              containerClassName="pagination"
              activeClassName="active"
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