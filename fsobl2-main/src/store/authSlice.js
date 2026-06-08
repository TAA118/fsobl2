import { createSlice } from '@reduxjs/toolkit'

const getRoleFromToken = (token) => {
  if (!token) return null
  try {
    const [, payload] = token.split('.')
    const parsed = JSON.parse(atob(payload))
    return parsed?.rolUsu || null
  } catch (error) {
    console.error('Error decodificando token:', error)
    return null
  }
}

const initialToken = localStorage.getItem('token') || null
const initialPlan = localStorage.getItem('plan') || null
const initialRole = getRoleFromToken(initialToken)

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: initialToken,
    plan: initialPlan,
    role: initialRole
  },
  reducers: {
    setAuth(state, action) {
      const { token, plan } = action.payload
      state.token = token || null
      state.plan = plan || state.plan
      state.role = getRoleFromToken(token) || state.role
      if (token) {
        localStorage.setItem('token', token)
      }
      if (plan) {
        localStorage.setItem('plan', plan)
      }
    },
    setToken(state, action) {
      state.token = action.payload
      state.role = getRoleFromToken(action.payload)
      if (action.payload) {
        localStorage.setItem('token', action.payload)
      } else {
        localStorage.removeItem('token')
      }
    },
    setPlan(state, action) {
      state.plan = action.payload
      if (action.payload) {
        localStorage.setItem('plan', action.payload)
      } else {
        localStorage.removeItem('plan')
      }
    },
    setRole(state, action) {
      state.role = action.payload
    },
    logout(state) {
      state.token = null
      state.plan = null
      state.role = null
      localStorage.removeItem('token')
      localStorage.removeItem('plan')
    }
  }
})

export const { setAuth, setToken, setPlan, setRole, logout } = authSlice.actions
export default authSlice.reducer
