import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Logo from '../components/Logo'
import '../styles/auth.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: errorLogin } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (errorLogin) {
      setError(
        errorLogin.message === 'Invalid login credentials'
          ? 'Email o contraseña incorrectos'
          : errorLogin.message
      )
      setLoading(false)
      return
    }

    navigate('/descubrir')
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
            type="text"
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
