import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './Layout'
import Login from './Login'
import Register from './Register'
import Dashboard from './Dashboard'
import Welcome from './Welcome'
import RutaNoEncontrada from './RutaNoEncontrada'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/" element={<Layout />}>
          <Route index element={<Welcome />} />
          <Route path="dashboard" element={<Dashboard />} />
        </Route>

        <Route path="*" element={<RutaNoEncontrada />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
