import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { MOTIVOS_DENUNCIA, traducirDato } from '../lib/constantes'
import { useIdioma } from '../lib/i18n'

/**
 * Botón de denuncia con su formulario.
 *
 * El aviso legal promete un canal para avisar de contenido ilícito. Tenerlo
 * solo como un correo dentro del texto legal no sirve: cuando alguien ve
 * algo repugnante necesita un botón donde lo está viendo.
 */
export default function Denunciar({ perfil, compacto = false }) {
  const { usuario } = useAuth()
  const { t, idioma } = useIdioma()
  const [abierto, setAbierto] = useState(false)
  const [motivo, setMotivo] = useState('')
  const [detalle, setDetalle] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviada, setEnviada] = useState(false)
  const [error, setError] = useState('')

  const enviar = async (e) => {
    e.preventDefault()
    setError('')
    setEnviando(true)

    const { error: errorEnvio } = await supabase.from('denuncias').insert({
      denunciante: usuario.id,
      denunciado: perfil.id,
      motivo,
      detalle: detalle.trim(),
    })

    setEnviando(false)
    if (errorEnvio) {
      if (errorEnvio.code === '23505') {
        setError(t('errYaDenunciado'))
        return
      }
      setError(
        errorEnvio.message.includes('denuncias')
          ? 'Falta ejecutar supabase/14_denuncias.sql en Supabase'
          : errorEnvio.message
      )
      return
    }
    setEnviada(true)
  }

  if (enviada) {
    return (
      <p className="denuncia-enviada">
        {t('denunciaEnviada')}
      </p>
    )
  }

  if (!abierto) {
    return (
      <button
        type="button"
        className={`boton-denunciar ${compacto ? 'boton-denunciar--compacto' : ''}`}
        onClick={() => setAbierto(true)}
      >
        {t('denunciarPerfil')}
      </button>
    )
  }

  return (
    <form className="denuncia-formulario" onSubmit={enviar}>
      <label className="campo-etiqueta">{t('queOcurreCon', { nombre: perfil.nombre })}</label>
      <select value={motivo} onChange={(e) => setMotivo(e.target.value)} required>
        <option value="">{t('eligeMotivo')}</option>
        {MOTIVOS_DENUNCIA.map((m) => (
          <option key={m} value={m}>{traducirDato(m, idioma)}</option>
        ))}
      </select>

      <textarea
        value={detalle}
        onChange={(e) => setDetalle(e.target.value)}
        maxLength={300}
        rows={3}
        placeholder={t('cuentanosQuePaso')}
      />

      {error && <span className="denuncia-error">{error}</span>}

      <div className="denuncia-botones">
        <button type="button" onClick={() => setAbierto(false)}>{t('cancelar')}</button>
        <button type="submit" className="btn-no" disabled={!motivo || enviando}>
          {enviando ? t('enviando') : t('enviarDenuncia')}
        </button>
      </div>
    </form>
  )
}
