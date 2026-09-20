import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { MIN_CONTRASENA } from '../lib/constantes'
import { mensajeError } from '../lib/errores'
import { useIdioma } from '../lib/i18n'

/**
 * Formulario de contraseña nueva.
 *
 * Lo usan dos sitios: quien llega desde el enlace del correo porque la ha
 * olvidado, y quien la cambia desde Mi perfil. En los dos casos hay sesión
 * abierta, así que basta con `updateUser`.
 */
export default function CambiarClave({ onHecho, textoBoton }) {
  const { t } = useIdioma()
  const [clave, setClave] = useState('')
  const [repetida, setRepetida] = useState('')
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  const enviar = async (e) => {
    e.preventDefault()
    setError('')

    if (clave.length < MIN_CONTRASENA) {
      setError(t('errContrasenaCorta'))
      return
    }
    if (clave !== repetida) {
      setError(t('errClavesNoCoinciden'))
      return
    }

    setGuardando(true)
    const { error: errorCambio } = await supabase.auth.updateUser({ password: clave })
    setGuardando(false)

    if (errorCambio) {
      setError(mensajeError(errorCambio, t))
      return
    }
    setClave('')
    setRepetida('')
    onHecho?.()
  }

  return (
    <form className="form-clave" onSubmit={enviar}>
      {error && <div className="aviso aviso--error">{error}</div>}

      <input
        type="password"
        autoComplete="new-password"
        placeholder={t('contrasenaNueva')}
        value={clave}
        onChange={(e) => setClave(e.target.value)}
        required
      />
      <input
        type="password"
        autoComplete="new-password"
        placeholder={t('repiteContrasena')}
        value={repetida}
        onChange={(e) => setRepetida(e.target.value)}
        required
      />
      <button type="submit" disabled={guardando}>
        {guardando ? t('guardando') : (textoBoton ?? t('guardarContrasena'))}
      </button>
    </form>
  )
}
