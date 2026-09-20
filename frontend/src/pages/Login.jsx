import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Logo from '../components/Logo'
import SelectorIdioma from '../components/SelectorIdioma'
import { useIdioma } from '../lib/i18n'
import '../styles/auth.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { t } = useIdioma()

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
          ? t('credencialesMal')
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
      <SelectorIdioma flotante />
      <header className="auth-cabecera">
        <Logo variante="completo" />
        <p>{t('lema')}</p>
      </header>

      <div className="auth-box">
        <h1>{t('bienvenido')}</h1>
        <h2>{t('entraParaSeguir')}</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder={t("email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder={t("contrasena")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? t('cargando') : t('entrar')}
          </button>
        </form>

        <p>{t('sinCuenta')} <Link to="/registro">{t('registrate')}</Link></p>
      </div>
    </div>
  )
}
