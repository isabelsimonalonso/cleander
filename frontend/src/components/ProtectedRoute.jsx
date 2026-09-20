import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Envuelve una ruta privada.
 * `soloAdmin` la restringe al panel de administración.
 */
export default function ProtectedRoute({ children, soloAdmin = false }) {
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

  if (soloAdmin && rol !== 'admin') {
    return <Navigate to="/descubrir" replace />
  }

  return children
}
