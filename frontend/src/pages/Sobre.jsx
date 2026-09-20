import { Link } from 'react-router-dom'
import { CONTACTO } from '../lib/constantes'
import { SOBRE } from '../lib/sobre'
import { useIdioma } from '../lib/i18n'
import Logo from '../components/Logo'
import SelectorIdioma from '../components/SelectorIdioma'
import '../styles/sobre.css'

export default function Sobre() {
  const { idioma, t } = useIdioma()
  const sobre = SOBRE[idioma] ?? SOBRE.es

  return (
    <div className="sobre-container">
      <SelectorIdioma flotante />

      <header className="sobre-cabecera">
        <Link to="/login" aria-label="CleanDerApp">
          <Logo variante="completo" />
        </Link>
        <p className="sobre-entradilla">{sobre.entradilla}</p>
      </header>

      <main className="sobre-contenido">
        <h1>{sobre.titulo}</h1>

        {sobre.secciones.map((s, i) => (
          <section key={i} className="sobre-seccion">
            <h2>{s.titulo}</h2>

            {s.parrafos?.map((p, j) => <p key={j}>{p}</p>)}

            {s.pasos && (
              <ol className="sobre-pasos">
                {s.pasos.map((paso, j) => (
                  <li key={j}>
                    <strong>{paso.titulo}</strong>
                    <span>{paso.texto}</span>
                  </li>
                ))}
              </ol>
            )}

            {s.contacto && (
              <a className="sobre-correo" href={`mailto:${CONTACTO}`}>{CONTACTO}</a>
            )}
          </section>
        ))}

        <div className="sobre-acciones">
          <Link className="sobre-boton" to="/registro">{t('crearCuenta')}</Link>
          <Link className="sobre-enlace" to="/login">{t('entrar')}</Link>
        </div>
      </main>
    </div>
  )
}
