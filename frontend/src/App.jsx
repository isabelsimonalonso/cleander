import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { IdiomaProvider } from './lib/i18n'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Recuperar from './pages/Recuperar'
import NuevaClave from './pages/NuevaClave'
import Descubrir from './pages/Descubrir'
import Matches from './pages/Matches'
import MiPerfil from './pages/MiPerfil'
import Valoraciones from './pages/Valoraciones'
import Admin from './pages/Admin'
import Privacy from './pages/Privacy'
import Sobre from './pages/Sobre'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import { configuracionValida } from './lib/supabase'
import './styles/app.css'
import './styles/footer.css'

/** Sin claves de Supabase la app no puede hacer nada: se explica por qué. */
function FaltaConfiguracion() {
  return (
    <div className="pantalla-carga">
      <div style={{ maxWidth: 460, lineHeight: 1.7 }}>
        <h2 style={{ color: '#24a4bc', marginBottom: 12 }}>Falta configurar Supabase</h2>
        <p>
          No se ha encontrado una clave válida de Supabase, así que no se puede
          entrar ni registrar a nadie.
        </p>
        <p style={{ marginTop: 12 }}>
          <strong>En tu ordenador:</strong> copia <code>frontend/.env.example</code> a{' '}
          <code>frontend/.env</code> y pega tu clave <code>anon public</code> en{' '}
          <code>VITE_SUPABASE_ANON_KEY</code>.
        </p>
        <p style={{ marginTop: 12 }}>
          <strong>En GitHub Pages:</strong> añade <code>VITE_SUPABASE_URL</code> y{' '}
          <code>VITE_SUPABASE_ANON_KEY</code> en Settings → Secrets and variables → Actions.
        </p>
      </div>
    </div>
  )
}

/** La portada decide a dónde vas: sin sesión al login, con sesión a tu sitio. */
function Inicio() {
  const { sesion, rol, cargando } = useAuth()
  if (cargando) return <div className="pantalla-carga">…</div>
  if (!sesion) return <Login />
  return <Navigate to={rol === 'admin' ? '/admin' : '/descubrir'} replace />
}

/**
 * Quien llega desde el enlace de «he olvidado la contraseña» tiene sesión,
 * pero no queremos soltarle dentro: primero la cambia. Va por encima de las
 * rutas porque el correo abre siempre la raíz, no una dirección concreta.
 */
function Rutas({ modo }) {
  const { recuperandoClave, terminarRecuperacion } = useAuth()
  if (recuperandoClave) return <NuevaClave onHecho={terminarRecuperacion} />

  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route
        path="/recuperar"
        element={<Recuperar caducado={modo === 'caducado'} />}
      />
      <Route path="/privacidad" element={<Privacy />} />
      <Route path="/sobre-nosotros" element={<Sobre />} />

      <Route
        path="/descubrir"
        element={<ProtectedRoute acceso="usuarios"><Descubrir /></ProtectedRoute>}
      />
      <Route
        path="/matches"
        element={<ProtectedRoute acceso="usuarios"><Matches /></ProtectedRoute>}
      />
      <Route
        path="/valoraciones"
        element={<ProtectedRoute acceso="usuarios"><Valoraciones /></ProtectedRoute>}
      />
      <Route
        path="/perfil"
        element={<ProtectedRoute acceso="usuarios"><MiPerfil /></ProtectedRoute>}
      />
      <Route
        path="/admin"
        element={<ProtectedRoute acceso="admin"><Admin /></ProtectedRoute>}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App({ modo = 'normal' }) {
  if (!configuracionValida) return <FaltaConfiguracion />

  return (
    // HashRouter (rutas con #) porque GitHub Pages sirve archivos estáticos
    // y devolvería 404 al recargar en cualquier ruta que no sea la raíz.
    <HashRouter>
      <IdiomaProvider>
      <AuthProvider recuperando={modo === 'recuperar'}>
        {/* Un enlace caducado abre la pantalla de pedir otro, no la portada */}
        {modo === 'caducado' && <Navigate to="/recuperar" replace />}
        <div className="raiz">
          <div className="raiz-contenido">
            <Rutas modo={modo} />
          </div>
          <Footer />
        </div>
      </AuthProvider>
      </IdiomaProvider>
    </HashRouter>
  )
}
