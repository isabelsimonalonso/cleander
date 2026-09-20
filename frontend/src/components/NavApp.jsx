import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'

export default function NavApp() {
  const { rol, logout } = useAuth()
  const navigate = useNavigate()
  const esAdmin = rol === 'admin'

  const salir = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="nav-app">
      <div className="nav-marca">
        <Logo size={30} />
        <span>Cleander</span>
      </div>

      <div className="nav-enlaces">
        {esAdmin ? (
          // La administración gestiona la plataforma, no participa en ella.
          <NavLink to="/admin">Panel de administración</NavLink>
        ) : (
          <>
            <NavLink to="/descubrir">Descubrir</NavLink>
            <NavLink to="/matches">Matches</NavLink>
            <NavLink to="/perfil">Mi perfil</NavLink>
          </>
        )}
      </div>

      <button className="nav-salir" onClick={salir}>Salir</button>
    </nav>
  )
}
