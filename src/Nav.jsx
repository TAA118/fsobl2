import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { logout } from './store/authSlice.js'

const Nav = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleOnClickCerrarSesion = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <nav className="nav">
      <Link to="/dashboard" className="nav__left">App Libros</Link>

      <div className="nav__right">
        <button onClick={handleOnClickCerrarSesion} className="btn btn--danger">Cerrar sesión</button>
      </div>
    </nav>
  )
}

export default Nav
