import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Envuelve una ruta privada.
 *
 * `acceso`:
 *   "usuarios" → solo cliente y servicio. El admin no participa en la
 *                plataforma, así que se le manda a su panel.
 *   "admin"    → solo administración.
 */
export default function ProtectedRoute({ children, acceso = 'usuarios' }) {
  const { sesion, perfil, rol, cargando } = useAuth()

  if (cargando) {
    return <div className="pantalla-carga">Cargando…</div>
  }

  if (!sesion) {
    return <Navigate to="/login" replace />
  }

  if (perfil?.bloqueado) {
    return (
      <div className="pantalla-carga">
        Tu cuenta está bloqueada. Escribe a soporte para revisarla.
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
