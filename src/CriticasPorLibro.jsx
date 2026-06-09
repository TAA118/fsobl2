import { useEffect, useState } from 'react'
import Paginate from './Paginate.jsx'
import { API_URL } from './config.js'

function CriticasPorLibro({ authHeaders, setLoading, setError }) {
  const [libros, setLibros] = useState([])
  const [libroSeleccionado, setLibroSeleccionado] = useState('')
  const [criticasLibro, setCriticasLibro] = useState([])
  const [page, setPage] = useState(1)

  const LIMIT = 5

  useEffect(() => {
    fetchLibros()
  }, [])

  const fetchLibros = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`${API_URL}/v1/libros`, {
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        }
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Error al obtener libros')
      }

      setLibros(data.libros || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchCriticasLibro = async (idLibro) => {
    if (!idLibro) {
      setCriticasLibro([])
      return
    }

    try {
      setLoading(true)
      setError(null)

      const res = await fetch(
        `${API_URL}/v1/libros/${idLibro}/criticas`,
        {
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders
          }
        }
      )

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Error al obtener críticas')
      }

      setCriticasLibro(data.criticas || [])
      setPage(1)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const criticasToShow = criticasLibro.slice(
    (page - 1) * LIMIT,
    page * LIMIT
  )

  return (
    <div className="dashboard-results">

      <div className="register-header">
        <h2>Críticas por libro</h2>
        <p>Selecciona un libro para ver sus críticas</p>
      </div>

      <label>
        Libro
        <select
          value={libroSeleccionado}
          onChange={(e) => {
            const id = e.target.value
            setLibroSeleccionado(id)
            fetchCriticasLibro(id)
          }}
        >
          <option value="">-- Selecciona un libro --</option>

          {libros.map((libro) => (
            <option key={libro.id} value={libro.id}>
              {libro.titulo}
            </option>
          ))}
        </select>
      </label>

      {libroSeleccionado && criticasLibro.length === 0 && (
        <p>No hay críticas para este libro.</p>
      )}

      {criticasLibro.length > 0 && (
        <>
          <ul className="dashboard-list">
            {criticasToShow.map((c) => (
              <li key={c.id} className="dashboard-item">
                <p>Usuario: {c.usuario?.nombreUsuario || 'Desconocido'}</p>
                <p>Puntaje: {c.puntaje} / 10</p>
                <p>{c.comentario}</p>
              </li>
            ))}
          </ul>

          {criticasLibro.length > LIMIT && (
            <Paginate
              pageCount={Math.ceil(criticasLibro.length / LIMIT)}
              currentPage={page}
              onPageChange={setPage}
            />
          )}
        </>
      )}

    </div>
  )
}

export default CriticasPorLibro