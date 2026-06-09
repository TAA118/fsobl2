import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { API_URL } from './config.js'
import { setPlan } from './store/authSlice.js'

function CambioPlan() {
  const dispatch = useDispatch()
  const { plan: userPlan, token } = useSelector((state) => state.auth)
  const isPremium = userPlan === 'premium'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  const handleUpgradePremium = async () => {
    if (isPremium) {
      setMessage('Ya eres usuario Premium.')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setMessage(null)

      const response = await fetch(`${API_URL}/v1/plan`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ plan: 'premium' })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar el plan')
      }

      dispatch(setPlan('premium'))
      setMessage(data.message || '¡Ahora eres usuario Premium!')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard-results">
      <div className="register-header">
        <h2>Cambio de plan</h2>
        <p>Actualiza tu plan de usuario a premium para eliminar límites y obtener más beneficios.</p>
      </div>

      <div className="dashboard-plan-card">
        {message && <div className="alert success">{message}</div>}
        {error && <div className="alert error">{error}</div>}
        <p>Plan actual: <strong>{isPremium ? 'Premium' : 'Plus'}</strong></p>
        <button
          type="button"
          className="btn btn--primary"
          onClick={handleUpgradePremium}
          disabled={loading || isPremium}
          aria-disabled={isPremium}
          style={isPremium ? { pointerEvents: 'none', opacity: 0.6 } : {}}
        >
          {isPremium ? 'Usuario Premium' : 'Actualizar a Premium'}
        </button>
      </div>
    </div>
  )
}

export default CambioPlan
