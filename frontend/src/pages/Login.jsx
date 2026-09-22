import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { DOMINIO_INTERNO } from '../lib/constantes'
import { mensajeError } from '../lib/errores'
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

    // Supabase necesita un correo, pero quien administra escribe solo
    // "admin". Si no hay arroba, se completa con el dominio interno.
    const escrito = email.trim()
    const correo = escrito.includes('@') ? escrito : `${escrito}${DOMINIO_INTERNO}`

    const { error: errorLogin } = await supabase.auth.signInWithPassword({
      email: correo,
      password,
    })

    if (errorLogin) {
      setError(mensajeError(errorLogin, t))
      setLoading(false)
      return
    }

    // La portada decide el destino: el admin va a su panel, el resto a descubrir.
    navigate('/')
  }

  return (
    <div className="auth-container auth-portada">
      <SelectorIdioma flotante />
      <header className="auth-cabecera">
        <Logo variante="completo" />
      </header>

      <section className="auth-reclamo">
        <p className="auth-reclamo-preguntas">
          <span>{t('reclamoNecesitas')}</span>
          <span>{t('reclamoOfreces')}</span>
        </p>
        <p className="auth-reclamo-texto">{t('reclamoQueEs')}</p>
        <p className="auth-reclamo-texto">{t('reclamoComoVa')}</p>
        <ul className="auth-reclamo-claves">
          <li>{t('reclamoGratis')}</li>
          <li>{t('reclamoSinComisiones')}</li>
          <li>{t('reclamoSinIntermediarios')}</li>
        </ul>
      </section>

      <div className="auth-box">
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder={t('usuarioOEmail')}
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

        <p className="auth-olvido">
          <Link to="/recuperar">{t('olvidoContrasena')}</Link>
        </p>

        <div className="auth-alta">
          <span>{t('sinCuenta')}</span>
          <Link className="auth-secundario" to="/registro">{t('registrate')}</Link>
        </div>
      </div>
    </div>
  )
}
