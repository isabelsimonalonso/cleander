import { useState } from 'react'

/**
 * Muestra una puntuación de 1 a 5.
 * Si recibe `onVotar`, las estrellas se vuelven pulsables.
 */
export default function Estrellas({ valor = 0, total = null, onVotar = null, tamano = 18 }) {
  const [hover, setHover] = useState(0)
  const activa = hover || valor

  return (
    <span className="estrellas" style={{ fontSize: tamano }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`estrella ${n <= Math.round(activa) ? 'llena' : ''} ${onVotar ? 'votable' : ''}`}
          onMouseEnter={onVotar ? () => setHover(n) : undefined}
          onMouseLeave={onVotar ? () => setHover(0) : undefined}
          onClick={onVotar ? () => onVotar(n) : undefined}
          role={onVotar ? 'button' : undefined}
          aria-label={onVotar ? `Puntuar con ${n} estrellas` : undefined}
        >
          ★
        </span>
      ))}
      {total !== null && (
        <span className="estrellas-total">
          {Number(valor) > 0 ? Number(valor).toFixed(1) : '—'}
          {total > 0 && ` (${total})`}
        </span>
      )}
    </span>
  )
}
