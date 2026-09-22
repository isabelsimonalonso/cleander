import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'
import SelectorIdioma from './SelectorIdioma'
import { useIdioma } from '../lib/i18n'
import IconoApagar from './IconoApagar'

export default function NavApp() {
  const { rol, logout, matchesNuevos, valoracionesPendientes, denunciasResueltas } = useAuth()
  const navigate = useNavigate()
  const { t } = useIdioma()
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
          <NavLink to="/admin">{t('navAdmin')}</NavLink>
        ) : (
          <>
            <NavLink to="/descubrir">{t('navDescubrir')}</NavLink>
            <NavLink to="/matches" className="nav-con-aviso">
              {t('navMatches')}
              {matchesNuevos > 0 && (
                <span className="nav-aviso" aria-label={`${matchesNuevos} matches nuevos`}>
                  {matchesNuevos}
                </span>
              )}
            </NavLink>
            <NavLink to="/valoraciones" className="nav-con-aviso">
              {t('navValoraciones')}
              {valoracionesPendientes > 0 && (
                <span className="nav-aviso" aria-label={`${valoracionesPendientes} valoraciones pendientes`}>
                  {valoracionesPendientes}
                </span>
              )}
            </NavLink>
            <NavLink to="/perfil" className="nav-con-aviso">
              {t('navPerfil')}
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

      <SelectorIdioma />
      <button className="nav-salir" onClick={salir} title={t('navSalir')}>
        <IconoApagar />
      </button>
    </nav>
  )
}
