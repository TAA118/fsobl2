import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { API_URL } from './config.js'

function InformeUso() {
  const { token } = useSelector((state) => state.auth)
  const [informeUso, setInformeUso] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchInformeUso = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`${API_URL}/v1/criticas/informe/uso`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      const contentType = res.headers.get('content-type') || ''
      const data = contentType.includes('application/json')
        ? await res.json()
        : null

      if (!res.ok) {
        throw new Error(data?.message || 'Error al obtener el informe de uso')
      }

      setInformeUso(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchInformeUso()
  }, [fetchInformeUso])

  if (loading) {
    return <p>Cargando informe...</p>
  }

  if (error) {
    return <div className="alert error">{error}</div>
  }

  if (!informeUso) {
    return <p>No hay datos de uso para mostrar.</p>
  }

  const totalCriticas = informeUso.premium + informeUso.plus
  const pieData = [
    {
      name: 'Premium',
      value: informeUso.premium,
      percent: totalCriticas > 0 ? (informeUso.premium / totalCriticas) * 100 : 0
    },
    {
      name: 'Plus',
      value: informeUso.plus,
      percent: totalCriticas > 0 ? (informeUso.plus / totalCriticas) * 100 : 0
    }
  ]

  const renderLabel = ({ name, value, percent }) => `${name}: ${value} (${percent.toFixed(0)}%)`

  const tooltipFormatter = (value, name) => {
    const percent = totalCriticas > 0 ? ((value / totalCriticas) * 100).toFixed(0) : '0'
    return [`${value} (${percent}%)`, name]
  }

  return (
    <div className="dashboard-results">
      <div className="register-header">
        <h2>Informe de uso</h2>
      </div>

      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={120}
              label={renderLabel}
            >
              <Cell fill="#8884d8" />
              <Cell fill="#82ca9d" />
            </Pie>
            <Tooltip formatter={tooltipFormatter} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <p>Premium: {informeUso.premium} críticas ({pieData[0].percent.toFixed(0)}%)</p>
      <p>Plus: {informeUso.plus} críticas ({pieData[1].percent.toFixed(0)}%)</p>
    </div>
  )
}

export default InformeUso
