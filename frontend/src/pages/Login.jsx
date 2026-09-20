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

    // La portada decide el destino: el admin va a su panel, el resto a descubrir.
    navigate('/')
  }

  return (
    <div className="auth-container">
      <header className="auth-cabecera">
        <Logo variante="completo" />
        <p>Match de servicios domésticos</p>
      </header>

      <div className="auth-box">
        <h1>Bienvenido</h1>
        <h2>Inicia sesión para continuar</h2>

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
