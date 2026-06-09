import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { API_URL } from './config.js'

function AgregarCritica() {
  const [libros, setLibros] = useState([])
  const { token } = useSelector((state) => state.auth)
  const [form, setForm] = useState({idLibro: '',puntaje: 5,comentario: ''})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  const fetchLibros = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`${API_URL}/v1/libros`, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      setLibros(data.libros || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    // Carga inicial de datos de la ruta.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLibros()
  }, [fetchLibros])

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)
      setError(null)
      setMessage(null)

      const res = await fetch(`${API_URL}/v1/criticas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          idLibro: form.idLibro,
          puntaje: Number(form.puntaje),
          comentario: form.comentario
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      setMessage('Crítica creada correctamente')

      setForm({
        idLibro: '',
        puntaje: 5,
        comentario: ''
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard-results">
      <div className="register-header">
        <h2>Agregar crítica</h2>
      </div>

      {loading && <p>Cargando...</p>}
      {error && <div className="alert error">{error}</div>}
      {message && <div className="alert success">{message}</div>}

      <form onSubmit={handleSubmit} className="register-form">

        <label>
          Libro
          <select
            value={form.idLibro}
            onChange={(e) =>
              setForm((p) => ({ ...p, idLibro: e.target.value }))
            }
            required
          >
            <option value="">Selecciona un libro</option>
            {libros.map((libro) => (
              <option key={libro.id} value={libro.id}>
                {libro.titulo}
              </option>
            ))}
          </select>
        </label>

        <label>
          Puntaje
          <select
            value={form.puntaje}
            onChange={(e) =>
              setForm((p) => ({ ...p, puntaje: Number(e.target.value) }))
            }
          >
            {[1,2,3,4,5,6,7,8,9,10].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>

        <label>
          Comentario
          <textarea
            value={form.comentario}
            onChange={(e) =>
              setForm((p) => ({ ...p, comentario: e.target.value }))
            }
            rows="4"
            required
          />
        </label>

        <button className="btn btn--primary" type="submit">
          Guardar crítica
        </button>

      </form>
    </div>
  )
}

export default AgregarCritica
