import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { API_URL } from './config'
import { setAuth } from './store/authSlice.js'

function Register() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid }
  } = useForm({ mode: 'onChange' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  const onSubmit = async (formData) => {
    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch(`${API_URL}/v1/registrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Error al registrar usuario')
      if (!data.token) throw new Error('Token no recibido')
      dispatch(setAuth({ token: data.token, plan: localStorage.getItem('plan') || null }))
      setMessage(`Usuario registrado correctamente: ${data.usuario?.nombreUsuario || formData.nombreUsuario}`)
      reset()
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <section className="register-card">
        <div className="register-header">
          <h1>Registro de usuario</h1>
        </div>

        <form className="register-form" onSubmit={handleSubmit(onSubmit)}>
          <label>
            Nombre de usuario
            <input
              {...register('nombreUsuario', { required: 'El nombre de usuario es obligatorio' })}
              placeholder="juanp"
              disabled={loading}
            />
            {errors.nombreUsuario && <span className="form-error">{errors.nombreUsuario.message}</span>}
          </label>

          <label>
            Nombre
            <input
              {...register('nombre', { required: 'El nombre es obligatorio' })}
              placeholder="Juan"
              disabled={loading}
            />
            {errors.nombre && <span className="form-error">{errors.nombre.message}</span>}
          </label>

          <label>
            Apellido
            <input
              {...register('apellido', { required: 'El apellido es obligatorio' })}
              placeholder="Pérez"
              disabled={loading}
            />
            {errors.apellido && <span className="form-error">{errors.apellido.message}</span>}
          </label>

          <label>
            Correo electrónico
            <input
              type="email"
              {...register('mail', {
                required: 'El correo es obligatorio',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Ingresa un correo válido'
                }
              })}
              placeholder="juan@ejemplo.com"
              disabled={loading}
            />
            {errors.mail && <span className="form-error">{errors.mail.message}</span>}
          </label>

          <label>
            Contraseña
            <input
              type="password"
              {...register('contrasena', { required: 'La contraseña es obligatoria' })}
              placeholder="••••••••"
              disabled={loading}
            />
            {errors.contrasena && <span className="form-error">{errors.contrasena.message}</span>}
          </label>

          {/* El registro público crea siempre un usuario normal; rol/plan se gestionan desde admin */}

          <button type="submit" disabled={loading}>{loading ? 'Registrando...' : 'Registrar'}</button>
        </form>

        {message && <div className="alert success">{message}</div>}
        {error && <div className="alert error">{error}</div>}

        <button type="button" className="back-button" onClick={() => navigate('/')}>Volver</button>
      </section>
    </div>
  )
}

export default Register
