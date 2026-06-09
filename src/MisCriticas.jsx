import { useEffect, useState } from 'react'
import Paginate from './Paginate.jsx'
import { API_URL } from './config.js'

function MisCriticas({ authHeaders, loading, setLoading, setError, setMessage }) {
  const [criticas, setCriticas] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ puntaje: 5, comentario: '' })

  const [page, setPage] = useState(1)
  const LIMIT = 5

  // -------------------------
  // FETCH MIS CRÍTICAS
  // -------------------------
  const fetchMisCriticas = async () => {
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

  useEffect(() => {
    fetchMisCriticas()
  }, [])

  // -------------------------
  // PAGINACIÓN
  // -------------------------
  const criticasToDisplay = criticas.slice(
    (page - 1) * LIMIT,
    page * LIMIT
  )

  // -------------------------
  // EDIT
  // -------------------------
  const handleEditClick = (critica) => {
    setEditingId(critica.id)
    setEditForm({
      puntaje: critica.puntaje,
      comentario: critica.comentario
    })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({ puntaje: 5, comentario: '' })
  }

  const handleSubmitEdit = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)

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

      setMessage('Crítica actualizada')
      handleCancelEdit()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // -------------------------
  // DELETE
  // -------------------------
  const handleDelete = async (id) => {
    try {
      setLoading(true)

      const res = await fetch(`${API_URL}/v1/criticas/${id}`, {
        method: 'DELETE',
        headers: authHeaders
      })

      if (!res.ok) throw new Error('Error al eliminar')

      setCriticas((prev) => prev.filter((c) => c.id !== id))
      setMessage('Crítica eliminada')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // -------------------------
  // UI
  // -------------------------
  return (
    <div className="dashboard-results">
      <div className="register-header">
        <h2>Mis críticas</h2>
      </div>

      {loading && <p>Cargando...</p>}

      {!loading && criticas.length === 0 && (
        <p>No tenés críticas todavía</p>
      )}

      <ul className="dashboard-list">
        {criticasToDisplay.map((critica) => (
          <li key={critica.id} className="dashboard-item">

            {editingId === critica.id ? (
              <form onSubmit={handleSubmitEdit}>
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
                  />
                </label>

                <button type="submit">Guardar</button>
                <button type="button" onClick={handleCancelEdit}>
                  Cancelar
                </button>
              </form>
            ) : (
              <>
                <strong>{critica.libro?.titulo}</strong>
                <p>Puntaje: {critica.puntaje}</p>
                <p>{critica.comentario}</p>

                <button onClick={() => handleEditClick(critica)}>
                  Editar
                </button>

                <button onClick={() => handleDelete(critica.id)}>
                  Eliminar
                </button>
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