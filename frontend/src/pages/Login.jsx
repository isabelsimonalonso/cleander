import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { auth } from '../services/api'
import Logo from '../components/Logo'
import '../styles/auth.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data } = await auth.login(email, password)
      login(data.usuario, data.token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Error en el login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="logo-container">
          <Logo size={80} />
        </div>
        <h1>Cleander</h1>
        <h2>Iniciar sesión</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Cargando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p>¿No tienes cuenta? <Link to="/registro">Regístrate</Link></p>
      </div>
    </div>
  )
}
