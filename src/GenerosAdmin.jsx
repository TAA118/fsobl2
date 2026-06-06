import { useEffect, useState } from 'react'
import { API_URL } from './config'

function GenerosAdmin({ authHeaders, setLoading, setError, setMessage, userRole }) {
  const [generos, setGeneros] = useState([])
  const [nombre, setNombre] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editNombre, setEditNombre] = useState('')
  const [localLoading, setLocalLoading] = useState(false)

  useEffect(() => {
    if (userRole === 'admin') {
      fetchGeneros()
    }
  }, [userRole])

  const fetchGeneros = async () => {
    if (userRole !== 'admin') {
      setError('Acceso denegado. Solo administradores pueden acceder a esta sección.')
      return
    }

    setLoading(true)
    setLocalLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/v1/generos`, {
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        }
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener los géneros')
      }
      setGeneros(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setLocalLoading(false)
    }
  }

  const handleSubmitGenero = async (e) => {
    e.preventDefault()
    if (!nombre.trim()) {
      setError('Ingresa el nombre del género.')
      return
    }

    setLoading(true)
    setLocalLoading(true)
    setError(null)
    setMessage(null)

    try {
      const response = await fetch(`${API_URL}/v1/generos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify({ nombre: nombre.trim() })
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Error al crear el género')
      }
      setGeneros((current) => [data, ...current])
      setNombre('')
      setMessage('Género creado correctamente.')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setLocalLoading(false)
    }
  }

  const handleEditClick = (genero) => {
    setEditingId(genero.id)
    setEditNombre(genero.nombre || '')
    setError(null)
    setMessage(null)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditNombre('')
  }

  const handleSubmitEdit = async (e) => {
    e.preventDefault()
    if (!editingId) return
    if (!editNombre.trim()) {
      setError('Ingresa el nombre del género.')
      return
    }

    setLoading(true)
    setLocalLoading(true)
    setError(null)
    setMessage(null)

    try {
      const response = await fetch(`${API_URL}/v1/generos/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify({ nombre: editNombre.trim() })
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar el género')
      }
      setGeneros((current) => current.map((g) => (g.id === editingId ? data : g)))
      setMessage('Género actualizado correctamente.')
      handleCancelEdit()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setLocalLoading(false)
    }
  }

  const handleEliminarGenero = async (generoId) => {
    setLoading(true)
    setLocalLoading(true)
    setError(null)
    setMessage(null)

    try {
      const response = await fetch(`${API_URL}/v1/generos/${generoId}`, {
        method: 'DELETE',
        headers: {
          ...authHeaders
        }
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Error al eliminar el género')
      }
      setGeneros((current) => current.filter((g) => g.id !== generoId))
      setMessage('Género eliminado correctamente.')
      if (editingId === generoId) {
        handleCancelEdit()
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setLocalLoading(false)
    }
  }

  if (userRole !== 'admin') {
    return (
      <div className="dashboard-results">
        <div className="register-header">
          <h2>Administración de géneros</h2>
          <p>No tienes permisos para acceder a esta sección.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-results">
      <div className="register-header">
        <h2>Administración de géneros</h2>
        <p>Agrega, edita o elimina géneros. Solo los admins tienen acceso a estas acciones.</p>
      </div>

      <form className="register-form" onSubmit={handleSubmitGenero}>
        <label>
          Nuevo género
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre del género"
            disabled={localLoading}
          />
        </label>
        <button type="submit" className="btn btn--primary" disabled={localLoading}>
          {localLoading ? 'Guardando...' : 'Agregar género'}
        </button>
      </form>

      <div className="dashboard-actions">
        <button type="button" className="btn btn--secondary" onClick={fetchGeneros} disabled={localLoading}>
          {localLoading ? 'Recargando...' : 'Recargar géneros'}
        </button>
      </div>

      {!localLoading && generos.length === 0 && <p>No hay géneros registrados.</p>}

      {!localLoading && generos.length > 0 && (
        <ul className="dashboard-list">
          {generos.map((genero) => (
            <li key={genero.id} className="dashboard-item">
              {editingId === genero.id ? (
                <form onSubmit={handleSubmitEdit} className="critica-edit-form">
                  <label>
                    Nombre
                    <input
                      value={editNombre}
                      onChange={(e) => setEditNombre(e.target.value)}
                      required
                    />
                  </label>
                  <div className="critica-actions">
                    <button type="submit" className="btn btn--primary" disabled={localLoading}>
                      Guardar
                    </button>
                    <button type="button" className="btn btn--secondary" onClick={handleCancelEdit} disabled={localLoading}>
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <strong>{genero.nombre}</strong>
                  <div className="critica-actions">
                    <button type="button" className="btn btn--primary" onClick={() => handleEditClick(genero)} disabled={localLoading}>
                      Editar
                    </button>
                    <button type="button" className="btn btn--secondary" onClick={() => handleEliminarGenero(genero.id)} disabled={localLoading}>
                      Eliminar
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default GenerosAdmin
