import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
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
      <div className="nav__left">App Libros</div>

      <div className="nav__right">
        <button onClick={handleOnClickCerrarSesion} className="btn btn--danger">Cerrar sesión</button>
      </div>
    </nav>
  )
}

export default Nav
