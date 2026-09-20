import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'

export default function NavApp() {
  const { rol, logout, matchesNuevos, valoracionesPendientes, denunciasResueltas } = useAuth()
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
        <span>CleanDerApp</span>
      </div>

      <div className="nav-enlaces">
        {esAdmin ? (
          // La administración gestiona la plataforma, no participa en ella.
          <NavLink to="/admin">Panel de administración</NavLink>
        ) : (
          <>
            <NavLink to="/descubrir">Descubrir</NavLink>
            <NavLink to="/matches" className="nav-con-aviso">
              Matches
              {matchesNuevos > 0 && (
                <span className="nav-aviso" aria-label={`${matchesNuevos} matches nuevos`}>
                  {matchesNuevos}
                </span>
              )}
            </NavLink>
            <NavLink to="/valoraciones" className="nav-con-aviso">
              Valoraciones
              {valoracionesPendientes > 0 && (
                <span className="nav-aviso" aria-label={`${valoracionesPendientes} valoraciones pendientes`}>
                  {valoracionesPendientes}
                </span>
              )}
            </NavLink>
            <NavLink to="/perfil" className="nav-con-aviso">
              Mi perfil
              {denunciasResueltas > 0 && (
                <span
                  className="nav-aviso nav-aviso--verde"
                  aria-label={`${denunciasResueltas} denuncias resueltas`}
                >
                  {denunciasResueltas}
                </span>
              )}
            </NavLink>
          </>
        )}
      </div>

      <button className="nav-salir" onClick={salir}>Salir</button>
    </nav>
  )
}
