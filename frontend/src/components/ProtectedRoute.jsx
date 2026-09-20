import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { CONTACTO } from '../lib/constantes'

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

  if (cargando) {
    return <div className="pantalla-carga">Cargando…</div>
  }

  if (!sesion) {
    return <Navigate to="/login" replace />
  }

  if (perfil?.bloqueado) {
    return (
      <div className="pantalla-bloqueada">
        <div className="pantalla-bloqueada-caja">
          <h1>Cuenta suspendida</h1>
          <p>
            Tu cuenta ha sido suspendida y no puedes usar CleanDerApp por
            ahora. Tu perfil no aparece en las búsquedas y quienes hicieron
            match contigo ya no ven tus datos de contacto.
          </p>
          {perfil.motivo_bloqueo && (
            <p className="motivo-bloqueo">
              <strong>Motivo:</strong> {perfil.motivo_bloqueo}
            </p>
          )}
          <p>
            Si crees que es un error o quieres que revisemos la decisión,
            escríbenos:
          </p>
          <a className="pantalla-bloqueada-correo" href={`mailto:${CONTACTO}`}>
            {CONTACTO}
          </a>
          <button onClick={logout}>Cerrar sesión</button>
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
