import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Descubrir from './pages/Descubrir'
import Matches from './pages/Matches'
import MiPerfil from './pages/MiPerfil'
import Admin from './pages/Admin'
import Privacy from './pages/Privacy'
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
        <h2 style={{ color: '#1da1b8', marginBottom: 12 }}>Falta configurar Supabase</h2>
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

/** La portada decide a dónde vas según si tienes sesión abierta. */
function Inicio() {
  const { sesion, cargando } = useAuth()
  if (cargando) return <div className="pantalla-carga">Cargando…</div>
  return sesion ? <Navigate to="/descubrir" replace /> : <Login />
}

export default function App() {
  if (!configuracionValida) return <FaltaConfiguracion />

  return (
    // HashRouter (rutas con #) porque GitHub Pages sirve archivos estáticos
    // y devolvería 404 al recargar en cualquier ruta que no sea la raíz.
    <HashRouter>
      <AuthProvider>
        <div className="raiz">
          <div className="raiz-contenido">
            <Routes>
              <Route path="/" element={<Inicio />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Registro />} />
              <Route path="/privacidad" element={<Privacy />} />

              <Route
                path="/descubrir"
                element={<ProtectedRoute><Descubrir /></ProtectedRoute>}
              />
              <Route
                path="/matches"
                element={<ProtectedRoute><Matches /></ProtectedRoute>}
              />
              <Route
                path="/perfil"
                element={<ProtectedRoute><MiPerfil /></ProtectedRoute>}
              />
              <Route
                path="/admin"
                element={<ProtectedRoute soloAdmin><Admin /></ProtectedRoute>}
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </AuthProvider>
    </HashRouter>
  )
}
