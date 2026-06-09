import { useEffect, useState } from 'react'
import { API_URL } from './config.js'
import Paginate from './Paginate.jsx'

function MisCriticas({ authHeaders, loading, setLoading, setError, setMessage }) {
  const [criticas, setCriticas] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ puntaje: 5, comentario: '' })

  const [page, setPage] = useState(1)
  const LIMIT = 5

  useEffect(() => {
    fetchCriticas()
  }, [])

  const fetchCriticas = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`${API_URL}/v1/criticas`, {
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        }
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.message)

      setCriticas(data.criticas || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = (critica) => {
    setEditingId(critica.id)
    setEditForm({
      puntaje: critica.puntaje,
      comentario: critica.comentario
    })
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditForm({ puntaje: 5, comentario: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`${API_URL}/v1/criticas/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify(editForm)
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.message)

      setCriticas((prev) =>
        prev.map((c) => (c.id === editingId ? data : c))
      )

      setMessage('Crítica actualizada correctamente')
      handleCancel()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      setLoading(true)

      const res = await fetch(`${API_URL}/v1/criticas/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        }
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message)
      }

      setCriticas((prev) => prev.filter((c) => c.id !== id))
      setMessage('Crítica eliminada correctamente')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const criticasToShow = criticas.slice(
    (page - 1) * LIMIT,
    page * LIMIT
  )

  return (
    <div className="dashboard-results">

      <div className="register-header">
        <h2>Mis críticas</h2>
      </div>

      {criticas.length === 0 && <p>No hay críticas todavía.</p>}

      <ul className="dashboard-list">
        {criticasToShow.map((c) => (
          <li key={c.id} className="dashboard-item">

            {editingId === c.id ? (
              <form className="critica-edit-form" onSubmit={handleSubmit}>

                <label>
                  Puntaje
                  <select
                    value={editForm.puntaje}
                    onChange={(e) =>
                      setEditForm((p) => ({
                        ...p,
                        puntaje: Number(e.target.value)
                      }))
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
                    value={editForm.comentario}
                    onChange={(e) =>
                      setEditForm((p) => ({
                        ...p,
                        comentario: e.target.value
                      }))
                    }
                    rows="3"
                  />
                </label>

                <div className="critica-actions">
                  <button className="btn btn--primary" type="submit">
                    Guardar
                  </button>

                  <button
                    className="btn btn--secondary"
                    type="button"
                    onClick={handleCancel}
                  >
                    Cancelar
                  </button>
                </div>

              </form>
            ) : (
              <>
                <strong>{c.libro?.titulo}</strong>

                <p>Autor: {c.libro?.autor}</p>
                <p>Puntaje: {c.puntaje}</p>
                <p>{c.comentario}</p>

                <div className="critica-actions">
                  <button
                    className="btn btn--primary"
                    onClick={() => handleEditClick(c)}
                  >
                    Editar
                  </button>

                  <button
                    className="btn btn--secondary"
                    onClick={() => handleDelete(c.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </>
            )}

          </li>
        ))}
      </ul>

      {criticas.length > LIMIT && (
        <Paginate
          pageCount={Math.ceil(criticas.length / LIMIT)}
          currentPage={page}
          onPageChange={setPage}
        />
      )}

    </div>
  )
}

export default MisCriticas