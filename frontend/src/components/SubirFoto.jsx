import { useRef, useState } from 'react'
import { TAM_MAX_FOTO } from '../lib/constantes'
import { useIdioma } from '../lib/i18n'
import IconoCategoria from './IconoCategoria'

/**
 * Zona para la foto de perfil: se puede pulsar, arrastrar un archivo
 * encima o pegar una imagen del portapapeles.
 *
 * Valida aquí el tipo y el tamaño para dar un mensaje claro en vez de
 * esperar a que el servidor lo rechace.
 *
 * La foto no es obligatoria: quien no ponga ninguna sale con el icono de
 * su oficio. Aquí se ve cuál le toca antes de decidir, y quien ya haya
 * subido una puede volver al icono sin tener que borrarse la cuenta.
 */
export default function SubirFoto({ vistaPrevia, estado, categoria, onArchivo, onQuitar, onError }) {
  const { t } = useIdioma()
  const entrada = useRef(null)
  const [encima, setEncima] = useState(false)

  const aceptar = (archivo) => {
    if (!archivo) return
    if (!archivo.type.startsWith('image/')) {
      onError(t('errNoEsImagen'))
      return
    }
    if (archivo.size > TAM_MAX_FOTO) {
      const mb = (archivo.size / 1024 / 1024).toFixed(1)
      onError(t('errFotoPesa', { mb }))
      return
    }
    onError('')
    onArchivo(archivo)
  }

  const soltar = (e) => {
    e.preventDefault()
    setEncima(false)
    aceptar(e.dataTransfer.files?.[0])
  }

  const pegar = (e) => {
    const archivo = [...(e.clipboardData?.items ?? [])]
      .find((i) => i.type.startsWith('image/'))?.getAsFile()
    if (archivo) aceptar(archivo)
  }

  return (
    <div
      className={`zona-foto ${encima ? 'zona-foto--encima' : ''}`}
      role="button"
      tabIndex={0}
      onClick={() => entrada.current?.click()}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && entrada.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setEncima(true) }}
      onDragLeave={() => setEncima(false)}
      onDrop={soltar}
      onPaste={pegar}
    >
      <input
        ref={entrada}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          aceptar(e.target.files?.[0])
          e.target.value = ''       // permite volver a elegir la misma
        }}
      />

      {vistaPrevia ? (
        <img className="zona-foto-previa" src={vistaPrevia} alt="" />
      ) : (
        <div className="zona-foto-icono">
          <IconoCategoria categoria={categoria} />
        </div>
      )}

      <div className="zona-foto-texto">
        <strong>
          {t(encima ? 'sueltaFoto' : vistaPrevia ? 'cambiarFoto' : 'anadeFoto')}
        </strong>
        <small>{t('instruccionFoto')}</small>
        {estado && <span className={`estado-foto estado-foto--${estado.clase}`}>{estado.texto}</span>}

        {vistaPrevia ? (
          <button
            type="button"
            className="zona-foto-quitar"
            // El contenedor entero abre el explorador de archivos; sin
            // esto, quitar la foto acabaría pidiendo otra.
            onClick={(e) => { e.stopPropagation(); onQuitar() }}
          >
            {t('usarIcono')}
          </button>
        ) : (
          <small className="zona-foto-nota">{t('sinFotoIcono')}</small>
        )}
      </div>
    </div>
  )
}
