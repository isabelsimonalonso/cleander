import { IDIOMAS, useIdioma } from '../lib/i18n'

/**
 * Conmutador de idioma. Discreto pero presente en todas las pantallas:
 * en la barra cuando hay sesión, y suelto arriba en login y registro.
 */
export default function SelectorIdioma({ flotante = false }) {
  const { idioma, setIdioma, t } = useIdioma()

  return (
    <div
      className={`selector-idioma ${flotante ? 'selector-idioma--flotante' : ''}`}
      role="group"
      aria-label={t('idioma')}
    >
      {IDIOMAS.map((i) => (
        <button
          key={i.codigo}
          type="button"
          className={idioma === i.codigo ? 'activo' : ''}
          aria-pressed={idioma === i.codigo}
          title={i.nombre}
          onClick={() => setIdioma(i.codigo)}
        >
          {i.corto}
        </button>
      ))}
    </div>
  )
}
