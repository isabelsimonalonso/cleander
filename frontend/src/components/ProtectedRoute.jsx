import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { CONTACTO } from '../lib/constantes'
import { useIdioma } from '../lib/i18n'

/**
 * Envuelve una ruta privada.
 *
 * `acceso`:
 *   "usuarios" → solo cliente y servicio. El admin no participa en la
 *                plataforma, así que se le manda a su panel.
 *   "admin"    → solo administración.
 */
export default function ProtectedRoute({ children, acceso = 'usuarios' }) {
  const { sesion, perfil, rol, cargando, logout } = useAuth()
  const { t } = useIdioma()

  if (cargando) {
    return <div className="pantalla-carga">{t('cargando')}</div>
  }

  if (!sesion) {
    return <Navigate to="/login" replace />
  }

  if (perfil?.bloqueado) {
    return (
      <div className="pantalla-bloqueada">
        <div className="pantalla-bloqueada-caja">
          <h1>{t('cuentaSuspendida')}</h1>
          <p>{t('textoSuspension')}</p>
          {perfil.motivo_bloqueo && (
            <p className="motivo-bloqueo">
              <strong>{t('motivo')}</strong> {perfil.motivo_bloqueo}
            </p>
          )}
          <p>{t('siCreesError')}</p>
          <a className="pantalla-bloqueada-correo" href={`mailto:${CONTACTO}`}>
            {CONTACTO}
          </a>
          <button onClick={logout}>{t('cerrarSesion')}</button>
        </div>
      </div>
    )
  }

  if (acceso === 'admin' && rol !== 'admin') {
    return <Navigate to="/descubrir" replace />
  }

  if (acceso === 'usuarios' && rol === 'admin') {
    return <Navigate to="/admin" replace />
  }

  return children
}
