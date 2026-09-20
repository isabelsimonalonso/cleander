import isotipo from '../assets/isotipo.png'
import completo from '../assets/logo-cleander.png'

/**
 * El logo real de Cleander, recortado de la carpeta `fotos` del proyecto.
 *
 * - "isotipo"  → solo la casa, a un tamaño fijo. Para la barra de navegación.
 * - "completo" → la casa con la palabra CleanDer. Para login y registro.
 *
 * Ojo: la variante completa NO lleva ancho en línea a propósito. El tamaño
 * lo decide el CSS con clamp(), y un estilo en línea lo anularía.
 */
export default function Logo({ size = 64, variante = 'isotipo' }) {
  if (variante === 'completo') {
    return <img className="logo-completo" src={completo} alt="Cleander" draggable={false} />
  }

  return (
    <img
      className="logo-isotipo"
      src={isotipo}
      alt="Cleander"
      width={size}
      height={size}
      draggable={false}
    />
  )
}
