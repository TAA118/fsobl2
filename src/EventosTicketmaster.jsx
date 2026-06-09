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

  const handleBuscarEventos = async (e) => {
    e.preventDefault()
    if (!ciudad.trim()) {
      setError('Por favor ingresa el nombre de una ciudad')
      return
    }

    if (!token) {
      setError('No hay token de autenticación. Por favor, inicia sesión primero')
      return
    }

    setEventosLoading(true)
    setError(null)
    setMessage(null)

    try {
      const response = await fetch(
        `${API_URL}/v1/ciudad/${encodeURIComponent(ciudad)}?page=1&limit=5`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al buscar eventos')
      }

      setEventos(data.eventos || [])
      setTotalPages(data.totalPages || 1)
      setCurrentPage(1)
      setCiudadBuscada(data.ciudad || ciudad)
      setMessage(`Se encontraron ${data.total || 0} eventos en ${data.ciudad || ciudad}`)
    } catch (err) {
      setError(err.message)
      setEventos([])
    } finally {
      setEventosLoading(false)
    }
  }

  const handlePaginacion = async (page) => {
    if (!token) {
      setError('No hay token de autenticación')
      return
    }

    setEventosLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `${API_URL}/v1/ciudad/${encodeURIComponent(ciudadBuscada)}?page=${page}&limit=5`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      )

      const data = await response.json()

      if (!response.ok) {
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

  const handlePageChange = (event) => {
    const pageNumber = event.selected + 1
    handlePaginacion(pageNumber)
  }

  return (
    <div className="dashboard-results">
      <div className="register-header">
        <h2>Eventos Literarios</h2>
        <p>Busca eventos literarios en una ciudad específica</p>
      </div>

      <form className="register-form" onSubmit={handleBuscarEventos}>
        <label>
          Ciudad
          <input
            type="text"
            value={ciudad}
            onChange={(e) => setCiudad(e.target.value)}
            placeholder="Ej: Buenos Aires, Madrid, México"
            required
          />
        </label>
        <button type="submit" disabled={eventosLoading || loading}>
          {eventosLoading ? 'Buscando...' : 'Buscar eventos'}
        </button>
      </form>

      {eventos.length > 0 && (
        <>
          <div className="eventos-info">
            <p>
              <strong>Ciudad:</strong> {ciudadBuscada}
            </p>
            <p>
              <strong>Página:</strong> {currentPage} de {totalPages}
            </p>
          </div>

          <ul className="dashboard-list">
            {eventos.map((evento) => (
              <li key={evento.id} className="dashboard-item evento-item">
                {evento.imagen && (
                  <img
                    src={evento.imagen}
                    alt={evento.nombre}
                    className="evento-imagen"
                    style={{ maxWidth: '100%', maxHeight: '200px', marginBottom: '10px' }}
                  />
                )}
                <strong>{evento.nombre}</strong>
                <p>
                  <strong>Lugar:</strong> {evento.venue || 'No disponible'}
                </p>
                <p>
                  <strong>Fecha:</strong>{' '}
                  {evento.fecha_inicio
                    ? new Date(evento.fecha_inicio).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'No disponible'}
                </p>
                <p>{evento.descripcion}</p>
                <a
                  href={evento.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--primary"
                  style={{ display: 'inline-block', marginTop: '10px' }}
                >
                  Ver más detalles
                </a>
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <ReactPaginate
              previousLabel="← Anterior"
              nextLabel="Siguiente →"
              breakLabel="..."
              pageCount={totalPages}
              marginPagesDisplayed={2}
              pageRangeDisplayed={3}
              onPageChange={handlePageChange}
              forcePage={currentPage - 1}
              containerClassName="pagination"
              pageClassName="page-item"
              pageLinkClassName="page-link"
              previousClassName="page-item"
              previousLinkClassName="page-link"
              nextClassName="page-item"
              nextLinkClassName="page-link"
              breakClassName="page-item"
              breakLinkClassName="page-link"
              activeClassName="active"
              disabledClassName="disabled"
              style={{ textAlign: 'center', marginTop: '20px' }}
            />
          )}
        </>
      )}

      {!eventosLoading && eventos.length === 0 && ciudadBuscada && (
        <p>No se encontraron eventos para {ciudadBuscada}</p>
      )}
    </div>
  )
}

export default EventosTicketmaster