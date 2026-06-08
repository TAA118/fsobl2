import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { API_URL } from './config.js'
import { setAuth } from './store/authSlice.js'

function Login() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const {
    register,
    handleSubmit,
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
      const res = await fetch(`${API_URL}/v1/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Error al iniciar sesión')
      if (!data.token) throw new Error('Token no recibido')
      dispatch(setAuth({ token: data.token, plan: localStorage.getItem('plan') || null }))
      setMessage('Sesión iniciada correctamente')
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
          <h1>Iniciar sesión</h1>
          <p>Accede con tu usuario y contraseña.</p>
        </div>

        <form className="register-form" onSubmit={handleSubmit(onSubmit)}>
          <label>
            Usuario
            <input
              {...register('usuario', { required: 'El usuario es obligatorio' })}
              placeholder="usuario"
              disabled={loading}
            />
            {errors.usuario && <span className="form-error">{errors.usuario.message}</span>}
          </label>

          <label>
            Contraseña
            <input
              type="password"
              {...register('pass', { required: 'La contraseña es obligatoria' })}
              placeholder="••••••••"
              disabled={loading}
            />
            {errors.pass && <span className="form-error">{errors.pass.message}</span>}
          </label>

          <button type="submit" disabled={loading || !isValid}>{loading ? 'Entrando...' : 'Iniciar sesión'}</button>
        </form>

        {message && <div className="alert success">{message}</div>}
        {error && <div className="alert error">{error}</div>}

        <div className="register-note">
        </div>

        <button type="button" className="back-button" onClick={() => navigate('/')}>Volver</button>
      </section>
    </div>
  )
}

export default Login
