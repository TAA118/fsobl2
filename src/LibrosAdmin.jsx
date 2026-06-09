import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import Paginate from './Paginate.jsx'
import { API_URL } from './config'

function LibrosAdmin() {
  const { token, role: userRole } = useSelector((state) => state.auth)
  const [libros, setLibros] = useState([])
  const [createForm, setCreateForm] = useState({titulo: '', autor: '', genero: '', fecha: '', sinopsis: ''})
  const [filterGenero, setFilterGenero] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ titulo: '', autor: '', genero: '', fecha: '', sinopsis: '', imagenURL: '', imagenFile: null })
  const [deleteConfirm, setDeleteConfirm] = useState({ visible: false, libroId: null })
  const [localLoading, setLocalLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [limit] = useState(5)
  const [totalPages, setTotalPages] = useState(1)
  const [totalLibros, setTotalLibros] = useState(0)
  const [generos, setGeneros] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  const authHeaders = useMemo(() => ({
    Authorization: `Bearer ${token}`
  }), [token])

  const fetchGeneros = useCallback(async () => {
  try {
    const response = await fetch(`${API_URL}/v1/generos`, {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      }
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener géneros')
    }

    setGeneros(data || [])
  } catch (err) {
    setError(err.message)
  }
}, [authHeaders])

  const fetchLibros = useCallback(async () => {
    if (userRole !== 'admin') {
      setError('Acceso denegado. Sólo administradores pueden ver esta sección.')
      return
    }

    setLoading(true)
    setLocalLoading(true)
    setError(null)

    try {
      let url = `${API_URL}/v1/libros?limit=${limit}&page=${page}`
      if (filterGenero) {
        url += `&genero=${encodeURIComponent(filterGenero)}`
      }
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        }
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener los libros')
      }
      setLibros(data.libros || [])
      setPage(data.page || page)
      setTotalPages(data.totalPages || 1)
      setTotalLibros(data.total || 0)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setLocalLoading(false)
    }
  }, [authHeaders, filterGenero, limit, page, userRole])

  useEffect(() => {
    if (userRole === 'admin') {
      // Carga inicial de datos de la ruta.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchLibros()
      fetchGeneros()
    }
  }, [fetchGeneros, fetchLibros, userRole])

  const handleEditClick = (libro) => {
    setEditingId(libro.id)
    setEditForm({
      titulo: libro.titulo || '',
      autor: libro.autor || '',
      genero: libro.genero || '',
      fecha: libro.fecha ? new Date(libro.fecha).toISOString().slice(0, 10) : '',
      sinopsis: libro.sinopsis || '',
      imagenURL: libro.imagenURL || '',
      imagenFile: null
    })
    setError(null)
    setMessage(null)
  }

  const handleCreateLibro = async (e) => {
    e.preventDefault()

    setLoading(true)
    setLocalLoading(true)
    setError(null)
    setMessage(null)

    try {
      const body = {
        titulo: createForm.titulo,
        autor: createForm.autor,
        genero: createForm.genero,
        fecha: createForm.fecha ? new Date(createForm.fecha).toISOString() : null,
        sinopsis: createForm.sinopsis
        }

      const response = await fetch(`${API_URL}/v1/libros`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders
          },
          body: JSON.stringify(body)
        })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al crear libro')
      }

      setMessage('Libro creado correctamente')

      setCreateForm({
        titulo: '',
        autor: '',
        genero: '',
        fecha: '',
        sinopsis: '',
        imagenFile: null
      })

      fetchLibros()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setLocalLoading(false)
    }
  }    

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({ titulo: '', autor: '', genero: '', fecha: '', sinopsis: '' })
  }

  const handlePageChange = (newPage) => {
    setPage(newPage)
  }

  const handleSubmitEdit = async (e) => {
    e.preventDefault()
    if (!editingId) return

    setLoading(true)
    setLocalLoading(true)
    setError(null)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append('titulo', editForm.titulo)
      formData.append('autor', editForm.autor)
      formData.append('genero', editForm.genero)
      if (editForm.fecha) formData.append('fecha', new Date(editForm.fecha).toISOString())
      formData.append('sinopsis', editForm.sinopsis)
      if (editForm.imagenFile) {
        formData.append('imagen', editForm.imagenFile)
      }

      const response = await fetch(`${API_URL}/v1/libros/${editingId}`, {
        method: 'PUT',
        headers: {
          ...authHeaders
        },
        body: formData
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar el libro')
      }

      setLibros((current) => current.map((libro) => (libro.id === editingId ? data : libro)))
      setMessage('Libro actualizado correctamente.')
      handleCancelEdit()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setLocalLoading(false)
    }
  }

  const handleOpenDeleteConfirm = (libroId) => {
    setDeleteConfirm({ visible: true, libroId })
  }

  const handleCancelDelete = () => {
    setDeleteConfirm({ visible: false, libroId: null })
  }

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.libroId) return

    setLoading(true)
    setLocalLoading(true)
    setError(null)
    setMessage(null)

    try {
      const response = await fetch(`${API_URL}/v1/libros/${deleteConfirm.libroId}`, {
        method: 'DELETE',
        headers: {
          ...authHeaders
        }
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Error al eliminar el libro')
      }

      setLibros((current) => current.filter((libro) => libro.id !== deleteConfirm.libroId))
      setMessage('Libro eliminado correctamente.')
      handleCancelDelete()
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
          <h2>Administración de libros</h2>
          <p>No tienes permisos para acceder a esta sección.</p>
        </div>
      </div>

      
    )
  }

  return (
    <div className="dashboard-results">
      <div className="register-header">
        <h2>Administración de libros</h2>
        <p>Lista completa de libros. Edita o elimina los libros desde aquí.</p>
      </div>

      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}
      {loading && <p>Cargando...</p>}

      <div className="dashboard-item" style={{ marginBottom: '20px' }}>
  <h3>Crear nuevo libro</h3>

  <form onSubmit={handleCreateLibro} className="register-form">

    <label>
      Título
      <input
        value={createForm.titulo}
        onChange={(e) =>
          setCreateForm((prev) => ({
            ...prev,
            titulo: e.target.value
          }))
        }
        required
      />
    </label>

    <label>
      Autor
      <input
        value={createForm.autor}
        onChange={(e) =>
          setCreateForm((prev) => ({
            ...prev,
            autor: e.target.value
          }))
        }
        required
      />
    </label>

    <label>
      Género
          <select
      value={createForm.genero}
      onChange={(e) =>
        setCreateForm((prev) => ({
          ...prev,
          genero: e.target.value
        }))
      }
      required
    >
      <option value="">Seleccione un género</option>

      {generos.map((genero) => (
        <option
          key={genero.id}
          value={genero.nombre}
        >
          {genero.nombre}
        </option>
      ))}
    </select>
    </label>

    <label>
      Fecha
      <input
        type="date"
        value={createForm.fecha}
        onChange={(e) =>
          setCreateForm((prev) => ({
            ...prev,
            fecha: e.target.value
          }))
        }
        required
      />
    </label>

    <label>
      Sinopsis
      <textarea
        rows="4"
        value={createForm.sinopsis}
        onChange={(e) =>
          setCreateForm((prev) => ({
            ...prev,
            sinopsis: e.target.value
          }))
        }
        placeholder="Déjalo vacío para generar una sinopsis automáticamente"
      />
    </label>

    <button
      type="submit"
      className="btn btn--primary"
      disabled={localLoading}
    >
      Crear libro
    </button>

  </form>
</div>

      <div className="dashboard-actions">
        <label>
          Género
          <select
            value={filterGenero}
            onChange={(e) => {
              setFilterGenero(e.target.value)
              setPage(1)
            }}
            disabled={localLoading}
          >
            <option value="">Todos</option>
            {generos.map((genero) => (
              <option key={genero.id} value={genero.nombre}>
                {genero.nombre}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="btn btn--secondary" style={{ height: '40px' }} onClick={fetchLibros} disabled={localLoading}>
          {localLoading ? 'Recargando...' : 'Recargar'}
        </button>
      </div>

      {localLoading && <p>Cargando libros...</p>}
      {!localLoading && libros.length === 0 && <p>No hay libros registrados.</p>}

      {!localLoading && libros.length > 0 && (
        <>
          <div className="pagination-summary">
            <p>
              Mostrando {libros.length} de {totalLibros} libros — página {page} de {totalPages}
            </p>
          </div>
          <ul className="dashboard-list">
            {libros.map((libro) => (
              <li key={libro.id} className="dashboard-item">
              {editingId === libro.id ? (
                <form onSubmit={handleSubmitEdit} className="critica-edit-form">
                  <label>
                    Título
                    <input
                      value={editForm.titulo}
                      onChange={(e) => setEditForm((p) => ({ ...p, titulo: e.target.value }))}
                      required
                    />
                  </label>
                  <label>
                    Autor
                    <input
                      value={editForm.autor}
                      onChange={(e) => setEditForm((p) => ({ ...p, autor: e.target.value }))}
                      required
                    />
                  </label>
                  <label>
                    Género ja
                    <select
                        value={editForm.genero} onChange={(e) => setEditForm((p) => ({ ...p, genero: e.target.value}))}
                        required
                      >
                        <option value="">Seleccione un género</option>

                        {generos.map((genero) => (
                          <option
                            key={genero.id}
                            value={genero.nombre}
                          >
                            {genero.nombre}
                          </option>
                        ))}
                      </select>
                  </label>
                  <label>
                    Fecha
                    <input
                      type="date"
                      value={editForm.fecha}
                      onChange={(e) => setEditForm((p) => ({ ...p, fecha: e.target.value }))}
                      required
                    />
                  </label>
                  <label>
                    Sinopsis
                    <textarea
                      value={editForm.sinopsis}
                      onChange={(e) => setEditForm((p) => ({ ...p, sinopsis: e.target.value }))}
                      rows="4"
                    />
                  </label>
                  <label>
                    Portada
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setEditForm((p) => ({ ...p, imagenFile: e.target.files[0] || null }))}
                    />
                  </label>
                  {editForm.imagenURL && !editForm.imagenFile && (
                    <div className="book-cover-preview">
                      <img src={editForm.imagenURL} alt="Portada actual" />
                      <p>Portada actual</p>
                    </div>
                  )}
                  <div className="critica-actions">
                    <button type="submit" className="btn btn--primary" disabled={localLoading}>
                      Guardar cambios
                    </button>
                    <button type="button" className="btn btn--secondary" onClick={handleCancelEdit} disabled={localLoading}>
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <strong>{libro.titulo}</strong>
                  {libro.imagenURL && (
                    <div className="book-cover-preview">
                      <img src={libro.imagenURL} alt={`Portada de ${libro.titulo}`} />
                    </div>
                  )}
                  <p>Autor: {libro.autor}</p>
                  <p>Género: {libro.genero}</p>
                  <p>Fecha: {new Date(libro.fecha).toLocaleDateString()}</p>
                  {libro.sinopsis && <p>{libro.sinopsis}</p>}
                  <div className="critica-actions">
                    <button type="button" className="btn btn--primary" onClick={() => handleEditClick(libro)} disabled={localLoading}>
                      Editar
                    </button>
                    <button type="button" className="btn btn--secondary" onClick={() => handleOpenDeleteConfirm(libro.id)} disabled={localLoading}>
                      Eliminar
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </>
      )}

      {totalPages > 1 && (
        <Paginate
          pageCount={totalPages}
          currentPage={page}
          onPageChange={handlePageChange}
        />
      )}

      {deleteConfirm.visible && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3>Confirmar eliminación</h3>
            </div>
            <div className="modal-body">
              <p>¿Estás seguro de que quieres eliminar este libro?</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn--secondary" onClick={handleCancelDelete} disabled={localLoading}>
                Cancelar
              </button>
              <button type="button" className="btn btn--danger" onClick={handleConfirmDelete} disabled={localLoading}>
                {localLoading ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LibrosAdmin
