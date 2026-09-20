import { GRUPOS_SERVICIOS } from '../lib/constantes'

/**
 * Desplegable de servicios, agrupado por bloques.
 *
 * Con más de cuarenta opciones, una lista plana es inmanejable: los
 * grupos son lo que permite encontrar el que buscas de un vistazo.
 */
export default function SelectorServicio({
  value,
  onChange,
  requerido = true,
  className = '',
  placeholder = null,
}) {
  return (
    <select
      className={className}
      value={value ?? ''}
      required={requerido}
      onChange={onChange}
    >
      {placeholder !== null
        ? <option value="">{placeholder}</option>
        : !value && <option value="">Elige un servicio</option>}

      {GRUPOS_SERVICIOS.map(({ grupo, servicios }) => (
        <optgroup key={grupo} label={grupo}>
          {servicios.map((s) => <option key={s} value={s}>{s}</option>)}
        </optgroup>
      ))}
    </select>
  )
}
