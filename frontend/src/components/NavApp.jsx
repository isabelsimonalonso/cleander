import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'

export default function NavApp() {
  const { rol, logout } = useAuth()
  const navigate = useNavigate()

  const salir = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="nav-app">
      <div className="nav-marca">
        <Logo size={32} />
        <span>Cleander</span>
      </div>

      <div className="nav-enlaces">
        <NavLink to="/descubrir">Descubrir</NavLink>
        <NavLink to="/matches">Matches</NavLink>
        <NavLink to="/perfil">Mi perfil</NavLink>
        {rol === 'admin' && <NavLink to="/admin">Admin</NavLink>}
      </div>

      <button className="nav-salir" onClick={salir}>Salir</button>
    </nav>
  )
}
