import isotipo from '../assets/isotipo.png'
import completo from '../assets/logo-cleander.png'

/**
 * El logo real de Cleander, recortado de la carpeta `fotos` del proyecto.
 *
 * - variante "isotipo": solo la casa. Para la barra de navegación.
 * - variante "completo": la casa con la palabra CleanDer. Para login y registro.
 */
export default function Logo({ size = 64, variante = 'isotipo' }) {
  const esCompleto = variante === 'completo'

  return (
    <img
      src={esCompleto ? completo : isotipo}
      alt="Cleander"
      width={esCompleto ? size : size}
      height={esCompleto ? undefined : size}
      style={esCompleto ? { width: size, height: 'auto' } : { width: size, height: size }}
      draggable={false}
    />
  )
}
