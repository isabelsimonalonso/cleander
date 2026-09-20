import { useEffect, useState } from 'react'
import { PROVINCIAS, municipiosDe } from '../lib/ubicacion'

/**
 * Provincia y municipio encadenados, ambos de lista cerrada.
 *
 * Que nadie escriba la localidad a mano es lo que hace que los filtros
 * funcionen: si uno pone "Alfaz del pi" y otro "l'Alfàs del Pi", para la
 * base de datos son dos sitios distintos.
 *
 * Al cambiar de provincia se vacía el municipio, porque ya no pertenece
 * a la nueva.
 */
export default function SelectorUbicacion({
  provincia,
  municipio,
  onChange,
  requerido = true,
  etiquetas = true,
}) {
  const [municipios, setMunicipios] = useState([])
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    let activo = true
    if (!provincia) {
      setMunicipios([])
      return
    }
    setCargando(true)
    municipiosDe(provincia).then((lista) => {
      if (!activo) return
      setMunicipios(lista)
      setCargando(false)
    })
    return () => { activo = false }
  }, [provincia])

  return (
    <>
      {etiquetas && <label className="campo-etiqueta">Provincia</label>}
      <select
        value={provincia ?? ''}
        required={requerido}
        onChange={(e) => onChange({ provincia: e.target.value, ciudad: '' })}
      >
        <option value="">Elige provincia</option>
        {PROVINCIAS.map((p) => <option key={p} value={p}>{p}</option>)}
      </select>

      {etiquetas && <label className="campo-etiqueta">Municipio</label>}
      <select
        value={municipio ?? ''}
        required={requerido}
        disabled={!provincia || cargando}
        onChange={(e) => onChange({ provincia, ciudad: e.target.value })}
      >
        <option value="">
          {!provincia
            ? 'Elige antes la provincia'
            : cargando
              ? 'Cargando municipios…'
              : `Elige municipio (${municipios.length})`}
        </option>
        {municipios.map((m) => <option key={m} value={m}>{m}</option>)}
      </select>
    </>
  )
}
