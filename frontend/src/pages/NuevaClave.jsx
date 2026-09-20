import { useState } from 'react'
import Logo from '../components/Logo'
import SelectorIdioma from '../components/SelectorIdioma'
import CambiarClave from '../components/CambiarClave'
import { useIdioma } from '../lib/i18n'
import '../styles/auth.css'

/**
 * Pantalla a la que se llega pinchando el enlace del correo.
 *
 * No hay ruta que lleve aquí: la aplicación la enseña por encima de todo
 * cuando Supabase avisa de que la sesión viene de una recuperación.
 */
export default function NuevaClave({ onHecho }) {
  const { t } = useIdioma()
  const [listo, setListo] = useState(false)

  return (
    <div className="auth-container">
      <SelectorIdioma flotante />
      <header className="auth-cabecera">
        <Logo variante="completo" />
        <p>{t('lema')}</p>
      </header>

      <div className="auth-box">
        <h1>{t('nuevaClaveTitulo')}</h1>

        {listo ? (
          <>
            <p className="auth-exito">{t('nuevaClaveHecho')}</p>
            <button onClick={onHecho}>{t('entrar')}</button>
          </>
        ) : (
          <>
            <h2>{t('nuevaClaveSubtitulo')}</h2>
            <CambiarClave
              textoBoton={t('guardarYEntrar')}
              onHecho={() => setListo(true)}
            />
          </>
        )}
      </div>
    </div>
  )
}
