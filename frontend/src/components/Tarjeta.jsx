import { COPY } from '../lib/constantes'
import Estrellas from './Estrellas'

/** Iniciales como recurso cuando alguien no ha subido foto. */
function Iniciales({ nombre }) {
  const letras = (nombre || '?')
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
  return <div className="tarjeta-iniciales">{letras}</div>
}

/**
 * La tarjeta estilo Tinder. Sirve para los dos roles: solo cambian
 * la etiqueta de la esquina y el texto del precio.
 *
 * `telefono` llega con valor SOLO cuando hay match; si no, se pinta
 * un teléfono falso difuminado como señal de que existe pero está oculto.
 */
export default function Tarjeta({ perfil, telefono = null, children }) {
  const copy = COPY[perfil.rol] ?? COPY.cliente

  return (
    <article className="tarjeta">
      <div className="tarjeta-foto">
        {perfil.foto_url ? (
          <img src={perfil.foto_url} alt={perfil.nombre} loading="lazy" />
        ) : (
          <Iniciales nombre={perfil.nombre} />
        )}
        <span className={`tarjeta-etiqueta tarjeta-etiqueta--${perfil.rol}`}>
          {copy.etiqueta}
        </span>
      </div>

      <div className="tarjeta-cuerpo">
        <div className="tarjeta-cabecera">
          <h3>{perfil.nombre}</h3>
          <span className="tarjeta-precio">
            {Number(perfil.precio_hora).toFixed(0)} €<small>/h</small>
          </span>
        </div>

        <p className="tarjeta-categoria">{perfil.categoria}</p>
        <p className="tarjeta-ciudad">📍 {perfil.ciudad}</p>

        {perfil.resumen && <p className="tarjeta-resumen">{perfil.resumen}</p>}

        <Estrellas
          valor={Number(perfil.valoracion_media ?? 0)}
          total={Number(perfil.total_valoraciones ?? 0)}
        />

        <div className="tarjeta-telefono">
          {telefono ? (
            <a
              className="tarjeta-whatsapp"
              href={`https://wa.me/${telefono.replace(/[^\d]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              💬 {telefono}
            </a>
          ) : (
            <span className="tarjeta-telefono-oculto" aria-label="Teléfono oculto hasta el match">
              <span className="pixelado">+34 600 000 000</span>
              <small>🔒 visible al hacer match</small>
            </span>
          )}
        </div>

        {children}
      </div>
    </article>
  )
}
