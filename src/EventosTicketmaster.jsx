import { useState } from 'react'
import { useSelector } from 'react-redux'
import ReactPaginate from 'react-paginate'
import { API_URL } from './config.js'

function EventosTicketmaster({ loading, setError, setMessage }) {
  const [ciudad, setCiudad] = useState('')
  const [eventos, setEventos] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [ciudadBuscada, setCiudadBuscada] = useState('')
  const [eventosLoading, setEventosLoading] = useState(false)

  const { token } = useSelector((state) => state.auth)

  // -------------------------
  // BUSCAR EVENTOS
  // -------------------------
  const handleBuscarEventos = async (e) => {
    e.preventDefault()

    if (!ciudad.trim()) {
      setError('Por favor ingresa una ciudad')
      return
    }

    if (!token) {
      setError('No hay token de autenticación')
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

      if (!res.ok) {
        throw new Error(data.error || 'Error al buscar eventos')
      }

      // 🔥 TU BACKEND YA DEVUELVE "eventos" LISTOS
      setEventos(data.eventos || [])
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
  // PAGINACIÓN
  // -------------------------
  const handlePaginacion = async (page) => {
    if (!token) return

    setEventosLoading(true)
    setError(null)

    try {
      const res = await fetch(
        `${API_URL}/v1/ciudad/${encodeURIComponent(ciudadBuscada)}?page=${page}&limit=5`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Error al cargar eventos')
      }

      setEventos(data.eventos || [])
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

  // -------------------------
  // RENDER
  // -------------------------
  return (
    <div className="dashboard-results">
      <div className="register-header">
        <h2>Eventos literarios</h2>
        <p>Busca eventos en una ciudad</p>
      </div>

      {/* FORM */}
      <form className="register-form" onSubmit={handleBuscarEventos}>
        <label>
          Ciudad
          <input
            value={ciudad}
            onChange={(e) => setCiudad(e.target.value)}
            placeholder="Ej: Madrid, Buenos Aires"
            required
          />
        </label>

        <button type="submit" disabled={eventosLoading || loading}>
          {eventosLoading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {/* RESULTADOS */}
      {eventos.length > 0 && (
        <>
          <div className="dashboard-meta">
            <p><strong>Ciudad:</strong> {ciudadBuscada}</p>
            <p><strong>Página:</strong> {currentPage} / {totalPages}</p>
          </div>

          <ul className="dashboard-list">
            {Array.isArray(eventos) &&
              eventos.map((evento) => (
                <li key={evento.id} className="dashboard-item">
                  {evento.imagen && (
                    <img
                      src={evento.imagen}
                      alt={evento.nombre}
                      style={{ maxWidth: '100%', maxHeight: 200 }}
                    />
                  )}

                  <strong>{evento.nombre}</strong>

                  <p>
                    <strong>Lugar:</strong> {evento.venue || 'No disponible'}
                  </p>

                  <p>
                    <strong>Fecha:</strong>{' '}
                    {evento.fecha_inicio
                      ? new Date(evento.fecha_inicio).toLocaleString()
                      : 'No disponible'}
                  </p>

                  <p>{evento.descripcion}</p>

                  <a
                    href={evento.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn--primary"
                  >
                    Ver más
                  </a>
                </li>
              ))}
          </ul>

          {totalPages > 1 && (
            <ReactPaginate
              pageCount={totalPages}
              onPageChange={handlePageChange}
              forcePage={currentPage - 1}
              containerClassName="pagination"
              activeClassName="active"
            />
          )}
        </>
      )}

      {!eventosLoading && eventos.length === 0 && ciudadBuscada && (
        <p>No se encontraron eventos en {ciudadBuscada}</p>
      )}
    </div>
  )
}

export default EventosTicketmaster