import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

function InformeUso({ informeUso }) {
  if (!informeUso) {
    return null
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
    <div>
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
