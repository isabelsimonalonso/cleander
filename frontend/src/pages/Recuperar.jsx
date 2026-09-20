import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { mensajeError } from '../lib/errores'
import Logo from '../components/Logo'
import SelectorIdioma from '../components/SelectorIdioma'
import { useIdioma } from '../lib/i18n'
import '../styles/auth.css'

/**
 * «He olvidado la contraseña».
 *
 * Contestamos lo mismo exista o no la cuenta: decir «ese correo no está
 * registrado» permitiría averiguar quién usa la aplicación probando
 * direcciones, y aquí la gente publica su teléfono.
 */
export default function Recuperar({ caducado = false }) {
  const { t } = useIdioma()
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState(caducado ? t('errEnlaceCaducado') : '')
  const [enviando, setEnviando] = useState(false)

  const enviar = async (e) => {
    e.preventDefault()
    setError('')
    setEnviando(true)

    // Al volver del correo, la aplicación se abre en su raíz y detecta sola
    // que viene de una recuperación.
    const destino = window.location.origin + window.location.pathname

    const { error: errorEnvio } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: destino }
    )

    setEnviando(false)

    // Solo delatamos los fallos que no revelan nada, como el límite de envíos.
    if (errorEnvio && /rate limit|too many|for security purposes/i.test(errorEnvio.message)) {
      setError(mensajeError(errorEnvio, t))
      return
    }
    setEnviado(true)
  }

  return (
    <div className="auth-container">
      <SelectorIdioma flotante />
      <header className="auth-cabecera">
        <Logo variante="completo" />
        <p>{t('lema')}</p>
      </header>

      <div className="auth-box">
        <h1>{t('recuperarTitulo')}</h1>

        {enviado ? (
          <>
            <p className="auth-exito">{t('recuperarEnviado')}</p>
            <p className="campo-nota">{t('recuperarRevisaSpam')}</p>
            <p><Link to="/login">{t('volverAlLogin')}</Link></p>
          </>
        ) : (
          <>
            <h2>{t('recuperarSubtitulo')}</h2>
            {error && <div className="error-message">{error}</div>}

            <form onSubmit={enviar}>
              <input
                type="email"
                autoComplete="email"
                placeholder={t('email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" disabled={enviando}>
                {enviando ? t('enviando') : t('enviarEnlace')}
              </button>
            </form>

            <p>{t('teAcuerdas')} <Link to="/login">{t('iniciaSesion')}</Link></p>
          </>
        )}
      </div>
    </div>
  )
}
