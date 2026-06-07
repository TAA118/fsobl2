import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { API_URL } from './config.js'
import InformeUso from './InformeUso.jsx'
import CambioPlan from './CambioPlan.jsx'
import LibrosAdmin from './LibrosAdmin.jsx'
import GenerosAdmin from './GenerosAdmin.jsx'
import EventosTicketmaster from './EventosTicketmaster.jsx'
import { setPlan } from './store/authSlice.js'

function Dashboard() {
  const navigate = useNavigate()
  const [view, setView] = useState('inicio')
  const [criticas, setCriticas] = useState([])
  const [libros, setLibros] = useState([])
  const [form, setForm] = useState({ idLibro: '', puntaje: 5, comentario: '' })
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ puntaje: 5, comentario: '' })
  const [deleteConfirm, setDeleteConfirm] = useState({ visible: false, criticaId: null })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [libroSeleccionado, setLibroSeleccionado] = useState('')
  const [criticasLibro, setCriticasLibro] = useState([])
  const [informeUso, setInformeUso] = useState(null);
  const dispatch = useDispatch()
  const { token, plan: userPlan, role: userRole } = useSelector((state) => state.auth)
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {}


    //cam
  useEffect(() => {
    const cached = localStorage.getItem('plan')

    if (cached) {
      dispatch(setPlan(cached))
    }

    const fetchPlan = async () => {
      if (!token) return

      if (userRole !== 'cliente') return

      try {
        const response = await fetch(`${API_URL}/v1/plan`, {
          headers: {
            ...authHeaders
          }
        })

        const data = await response.json()

        if (response.ok) {
          dispatch(setPlan(data.plan))
        }
      } catch (err) {
        console.error(err)
      }
    }

    fetchPlan()
  }, [token, userRole, dispatch])
  
  const fetchMisCriticas = async () => {
    if (!token) {
      setError('No hay token de sesión. Inicia sesión primero.')
      return
    }

    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const response = await fetch(`${API_URL}/v1/criticas`, {
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        }
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener tus críticas')
      }
      setCriticas(data.criticas || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchLibros = async () => {
    if (!token) {
      setError('No hay token de sesión. Inicia sesión primero.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/v1/libros`, {
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

  setLoading(true)
  setError(null)

  try {
    const response = await fetch(
      `${API_URL}/v1/libros/${idLibro}/criticas`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        }
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener críticas')
    }

    setCriticasLibro(data.criticas || [])
  } catch (err) {
    setError(err.message)
  } finally {
    setLoading(false)
  }
}

  const handleSubmitCritica = async (e) => {
    e.preventDefault()
    if (!token) {
      setError('No hay token de sesión. Inicia sesión primero.')
      return
    }

    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const response = await fetch(`${API_URL}/v1/criticas`, {
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
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Error al crear la crítica')
      }
      setMessage('Crítica agregada correctamente.')
      setForm({ idLibro: '', puntaje: 5, comentario: '' })
      setView('misCriticas')
      setCriticas((current) => [data, ...current])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = (critica) => {
    setEditingId(critica.id)
    setEditForm({ puntaje: critica.puntaje, comentario: critica.comentario })
    setError(null)
    setMessage(null)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({ puntaje: 5, comentario: '' })
  }

  const handleSubmitEdit = async (e) => {
    e.preventDefault()
    if (!token) {
      setError('No hay token de sesión. Inicia sesión primero.')
      return
    }

    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const response = await fetch(`${API_URL}/v1/criticas/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify({
          puntaje: Number(editForm.puntaje),
          comentario: editForm.comentario
        })
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Error al editar la crítica')
      }
      setMessage('Crítica actualizada correctamente.')
      setCriticas((current) =>
        current.map((c) => (c.id === editingId ? data : c))
      )
      setEditingId(null)
      setEditForm({ puntaje: 5, comentario: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCritica = async (criticaId) => {
    if (!token) {
      setError('No hay token de sesión. Inicia sesión primero.')
      return
    }

    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const response = await fetch(`${API_URL}/v1/criticas/${criticaId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        }
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Error al eliminar la crítica')
      }
      setMessage('Crítica eliminada correctamente.')
      setCriticas((current) => current.filter((c) => c.id !== criticaId))
      setDeleteConfirm({ visible: false, criticaId: null })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDeleteConfirm = (criticaId) => {
    setDeleteConfirm({ visible: true, criticaId })
  }

  const handleCancelDelete = () => {
    setDeleteConfirm({ visible: false, criticaId: null })
  }

  const handleConfirmDelete = () => {
    if (deleteConfirm.criticaId) {
      handleDeleteCritica(deleteConfirm.criticaId)
    }
  }

  const handleViewChange = (nextView) => {
    setError(null)
    setMessage(null)
    setView(nextView)

    if (nextView === 'misCriticas') {
      fetchMisCriticas()
    } else if (nextView === 'agregarCritica') {
      fetchLibros()
    } else if (nextView === 'criticasLibro') {
      fetchLibros()
    } else if (nextView === 'informeUso') {
      fetchInformeUso()
    }

  }

  const fetchInformeUso = async () => {
  try {
    setLoading(true);
    setError(null);

    const response = await fetch(
      `${API_URL}/v1/criticas/informe/uso`,
      {
        headers: {
          ...authHeaders
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    setInformeUso(data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};



const totalCriticas = informeUso ? informeUso.premium + informeUso.plus : 0

const pieData = informeUso
  ? [
      {
        name: "Premium",
        value: informeUso.premium,
        percent: totalCriticas > 0 ? (informeUso.premium / totalCriticas) * 100 : 0
      },
      {
        name: "Plus",
        value: informeUso.plus,
        percent: totalCriticas > 0 ? (informeUso.plus / totalCriticas) * 100 : 0
      }
    ]
  : [];

const renderLabel = ({ name, value, percent }) => `${name}: ${value} (${percent.toFixed(0)}%)`

  const isPremium = userPlan === 'premium'
  const isAdmin = userRole === 'admin'

  return (
    <section className="dashboard">
      <div className="register-card dashboard-panel">
        <div className="register-header dashboard-header">
          <h1>Dashboard</h1>
          <p>Selecciona una acción para ver o crear tus críticas personales.</p>
        </div>

        <div className="dashboard-actions">
          <button type="button" className="btn btn--primary" onClick={() => handleViewChange('misCriticas')} disabled={loading}>
            Mis críticas
          </button>
          <button type="button" className="btn btn--secondary" onClick={() => handleViewChange('agregarCritica')} disabled={loading}>
            Agregar crítica
          </button>
          <button type="button" className="btn btn--secondary" onClick={() => handleViewChange('criticasLibro')}disabled={loading}>
          Buscar críticas por libro
        </button>
          <button type="button" className="btn btn--secondary" onClick={() => handleViewChange('informeUso')} disabled={loading}>
            Ver informe de uso
          </button>
          <button type="button" className="btn btn--secondary" onClick={() => handleViewChange('eventos')} disabled={loading}>
            Eventos
          </button>
          {isAdmin && (
            <button type="button" className="btn btn--secondary" onClick={() => handleViewChange('adminLibros')} disabled={loading}>
              Administrar libros
            </button>
          )}
          {isAdmin && (
            <button type="button" className="btn btn--secondary" onClick={() => handleViewChange('adminGeneros')} disabled={loading}>
              Administrar géneros
            </button>
          )}
          <button
            type="button"
            className={`btn btn--primary ${isPremium ? 'btn--disabled' : ''}`}
            onClick={() => handleViewChange('cambioPlan')}
            disabled={loading || isPremium}
            aria-disabled={isPremium}
            style={isPremium ? { pointerEvents: 'none', opacity: 0.6 } : {}}
          >
            {isPremium ? 'Usuario Premium' : 'Cambio de plan'}
          </button>
        </div>

        {error && <div className="alert error">{error}</div>}
        {message && <div className="alert success">{message}</div>}

        {view === 'inicio' && (
          <div className="dashboard-results">
            <div className="register-header">
              <h2>Elige una opción</h2>
              <p>Puedes revisar tus críticas existentes o agregar una nueva.</p>
            </div>
          </div>
        )}

        {view === 'misCriticas' && (
          <div className="dashboard-results">
            <div className="register-header">
              <h2>Mis críticas</h2>
              <p>Aquí se muestran las críticas que has escrito.</p>
            </div>
            {loading && <p>Cargando críticas...</p>}
            {!loading && criticas.length === 0 && <p>No hay críticas todavía. Agrega una nueva para que aparezca aquí.</p>}
            {!loading && criticas.length > 0 && (
              <ul className="dashboard-list">
                {criticas.map((critica) => (
                  <li key={critica.id} className="dashboard-item">
                    {editingId === critica.id ? (
                      <form onSubmit={handleSubmitEdit} className="critica-edit-form">
                        <label>
                          Puntaje
                          <select value={editForm.puntaje} onChange={(e) => setEditForm((p) => ({ ...p, puntaje: e.target.value }))}>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                              <option key={n} value={n}>{n}</option>
                            ))}
                          </select>
                        </label>
                        <label>
                          Comentario
                          <textarea
                            value={editForm.comentario}
                            onChange={(e) => setEditForm((p) => ({ ...p, comentario: e.target.value }))}
                            rows="3"
                            required
                          />
                        </label>
                        <div className="critica-actions">
                          <button type="submit" disabled={loading} className="btn btn--primary">Guardar</button>
                          <button type="button" onClick={handleCancelEdit} disabled={loading} className="btn btn--secondary">Cancelar</button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <strong>{critica.libro?.titulo || 'Libro no disponible'}</strong>
                        <p>Autor: {critica.libro?.autor || 'Desconocido'}</p>
                        <p>Puntaje: {critica.puntaje} / 10</p>
                        <p>{critica.comentario}</p>
                        <p className="dashboard-meta">Creada: {new Date(critica.createdAt).toLocaleDateString()}</p>
                        <div className="critica-actions">
                          <button onClick={() => handleEditClick(critica)} disabled={loading} className="btn btn--primary">Editar</button>
                          <button onClick={() => handleOpenDeleteConfirm(critica.id)} disabled={loading} className="btn btn--secondary">Eliminar</button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {deleteConfirm.visible && (
          <div className="modal-overlay">
            <div className="modal-dialog">
              <div className="modal-header">
                <h3>Confirmar eliminación</h3>
              </div>
              <div className="modal-body">
                <p>¿Estás seguro de que deseas eliminar esta crítica? Esta acción no se puede deshacer.</p>
              </div>
              <div className="modal-footer">
                <button onClick={handleCancelDelete} disabled={loading} className="btn btn--secondary">
                  Cancelar
                </button>
                <button onClick={handleConfirmDelete} disabled={loading} className="btn btn--danger">
                  {loading ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {view === 'agregarCritica' && (
          <div className="dashboard-results">
            <div className="register-header">
              <h2>Agregar crítica</h2>
              <p>Selecciona un libro y escribe tu opinión.</p>
            </div>
            <form className="register-form critica-form" onSubmit={handleSubmitCritica}>
              <label>
                Libro
                <select
                  name="idLibro"
                  value={form.idLibro}
                  onChange={(e) => setForm((p) => ({ ...p, idLibro: e.target.value }))}
                  required
                >
                  <option value="">-- Selecciona un libro --</option>
                  {libros.map((libro) => (
                    <option key={libro.id} value={libro.id}>
                      {libro.titulo}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Puntaje
                <select name="puntaje" value={form.puntaje} onChange={(e) => setForm((p) => ({ ...p, puntaje: e.target.value }))}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </label>
              <label>
                Comentario
                <textarea
                  name="comentario"
                  value={form.comentario}
                  onChange={(e) => setForm((p) => ({ ...p, comentario: e.target.value }))}
                  placeholder="Escribe tu crítica aquí..."
                  rows="4"
                  required
                />
              </label>
              <button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Guardar crítica'}</button>
            </form>
          </div>
        )}

        {view === 'criticasLibro' && (
          <div className="dashboard-results">
            <div className="register-header">
              <h2>Críticas por libro</h2>
              <p>Selecciona un libro para ver las críticas.</p>
            </div>

            <label>
              Libro
              <select
                value={libroSeleccionado}
                onChange={(e) => {
                  const idLibro = e.target.value
                  setLibroSeleccionado(idLibro)
                  fetchCriticasLibro(idLibro)
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

            {loading && <p>Cargando críticas...</p>}

            {!loading && criticasLibro.length === 0 && libroSeleccionado && (
              <p>No hay críticas para este libro.</p>
            )}

            {!loading && criticasLibro.length > 0 && (
              <ul className="dashboard-list">
                <strong>Críticas para: {libros.find((l) => l.id === libroSeleccionado)?.titulo || 'Libro no disponible'}</strong>
                {criticasLibro.map((critica) => (
                  <li key={critica.id} className="dashboard-item">

                    <p>
                      Autor: {critica.usuario?.nombreUsuario || 'Desconocido'}
                    </p>

                    <p>
                      Puntaje: {critica.puntaje} / 10
                    </p>

                    <p>{critica.comentario}</p>

                    <p className="dashboard-meta">
                      {new Date(
                        critica.createdAt
                      ).toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {view === 'cambioPlan' && (
          <CambioPlan
            authHeaders={authHeaders}
            loading={loading}
            setLoading={setLoading}
            setError={setError}
            setMessage={setMessage}
          />
        )}

        {view === 'adminLibros' && (
          <LibrosAdmin
            authHeaders={authHeaders}
            loading={loading}
            setLoading={setLoading}
            setError={setError}
            setMessage={setMessage}
            userRole={userRole}
          />
        )}

        {view === 'adminGeneros' && (
          <GenerosAdmin
            authHeaders={authHeaders}
            loading={loading}
            setLoading={setLoading}
            setError={setError}
            setMessage={setMessage}
            userRole={userRole}
          />
        )}

        {view === 'informeUso' && informeUso && (
          <div className="dashboard-results">
            <div className="register-header">
              <h2>Informe de uso</h2>
              <p>Cantidad de críticas por tipo de plan.</p>
            </div>

            <InformeUso informeUso={informeUso} />
          </div>
        )}

        {view === 'eventos' && (
          <EventosTicketmaster
            loading={loading}
            setLoading={setLoading}
            setError={setError}
            setMessage={setMessage}
          />
        )}
      </div>
    </section>
  )
}

export default Dashboard
