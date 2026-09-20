import { CONTACTO } from '../lib/constantes'
import { LEGAL } from '../lib/legal'
import { useIdioma } from '../lib/i18n'
import SelectorIdioma from '../components/SelectorIdioma'
import '../styles/privacy.css'

/**
 * Aviso legal, condiciones de uso y política de privacidad.
 *
 * El texto vive en legal.js, en español e inglés apartado por apartado.
 * Mientras el contacto siga entre corchetes, la página avisa de que el
 * servicio está en pruebas.
 */
const PENDIENTE = CONTACTO.startsWith('[')

function Seccion({ seccion, contactoPendiente }) {
  return (
    <section>
      <h2>{seccion.titulo}</h2>

      {seccion.parrafos?.map((p, i) => <p key={i}>{p}</p>)}

      {seccion.contacto && (
        PENDIENTE
          ? <p className="tenue-legal">{contactoPendiente}</p>
          : <p><strong>{CONTACTO}</strong></p>
      )}

      {seccion.lista && (
        <ul>{seccion.lista.map((li, i) => <li key={i}>{li}</li>)}</ul>
      )}

      {seccion.cierre?.map((p, i) => <p key={i}>{p}</p>)}
    </section>
  )
}

export default function Privacy() {
  const { idioma } = useIdioma()
  const legal = LEGAL[idioma] ?? LEGAL.es
  const hoy = new Date().toLocaleDateString(idioma === 'en' ? 'en-GB' : 'es-ES')

  return (
    <div className="privacy-container">
      <SelectorIdioma flotante />

      <div className="privacy-content">
        <h1>{legal.titulo}</h1>

        {PENDIENTE && (
          <section className="aviso-pendiente">
            <p>{legal.pendiente}</p>
          </section>
        )}

        <section className="aviso-destacado">
          <p><strong>{legal.resumenEtiqueta}</strong> {legal.resumen}</p>
        </section>

        {/* Leyéndolo en inglés conviene saberlo antes de empezar */}
        {idioma !== 'es' && (
          <section className="aviso-prevalencia">
            <p><strong>{legal.prevalenciaEtiqueta}</strong> {legal.prevalencia}</p>
          </section>
        )}

        {legal.secciones.map((s, i) => (
          <Seccion key={i} seccion={s} contactoPendiente={legal.contactoPendiente} />
        ))}

        <section className="legal-notice">
          <p><strong>{legal.normativaEtiqueta}</strong> {legal.normativa}</p>
          {idioma === 'es' && (
            <p><strong>{legal.prevalenciaEtiqueta}</strong> {legal.prevalencia}</p>
          )}
          <p><strong>{legal.actualizadoEtiqueta}</strong> {hoy}</p>
        </section>
      </div>
    </div>
  )
}
