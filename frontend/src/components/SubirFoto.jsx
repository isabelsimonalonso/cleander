import { useRef, useState } from 'react'
import { TAM_MAX_FOTO } from '../lib/constantes'

/**
 * Zona para la foto de perfil: se puede pulsar, arrastrar un archivo
 * encima o pegar una imagen del portapapeles.
 *
 * Valida aquí el tipo y el tamaño para dar un mensaje claro en vez de
 * esperar a que el servidor lo rechace.
 */
export default function SubirFoto({ vistaPrevia, estado, onArchivo, onError }) {
  const entrada = useRef(null)
  const [encima, setEncima] = useState(false)

  const aceptar = (archivo) => {
    if (!archivo) return
    if (!archivo.type.startsWith('image/')) {
      onError('Eso no es una imagen. Sube un JPG o un PNG.')
      return
    }
    if (archivo.size > TAM_MAX_FOTO) {
      const mb = (archivo.size / 1024 / 1024).toFixed(1)
      onError(`La foto pesa ${mb} MB y el máximo son 5. Reduce su tamaño.`)
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
        <img className="zona-foto-previa" src={vistaPrevia} alt="Tu foto de perfil" />
      ) : (
        <span className="zona-foto-hueco">Sin foto</span>
      )}

      <div className="zona-foto-texto">
        <strong>
          {encima ? 'Suelta aquí tu foto' : vistaPrevia ? 'Cambiar la foto' : 'Añade tu foto'}
        </strong>
        <small>Arrástrala, pégala o pulsa para elegirla · JPG o PNG, hasta 5 MB</small>
        {estado && <span className={`estado-foto estado-foto--${estado.clase}`}>{estado.texto}</span>}
      </div>
    </div>
  )
}
