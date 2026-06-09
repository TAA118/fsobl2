import { useEffect, useState } from 'react'
import { API_URL } from './config.js'

function AgregarCritica({ authHeaders, setLoading, setError, setMessage }) {
  const [libros, setLibros] = useState([])
  const [form, setForm] = useState({
    idLibro: '',
    puntaje: 5,
    comentario: ''
  })

  // -------------------------
  // fetch libros
  // -------------------------
  const fetchLibros = async () => {
    try {
      setLoading(true)

      const res = await fetch(`${API_URL}/v1/libros`, {
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
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
  }

  useEffect(() => {
    fetchLibros()
  }, [])

  // -------------------------
  // submit crítica
  // -------------------------
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
          ...authHeaders
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
              setForm((p) => ({ ...p, puntaje: e.target.value }))
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