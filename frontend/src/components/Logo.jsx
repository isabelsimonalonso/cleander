import isotipo from '../assets/isotipo.png'

/**
 * El logo de CleanDerApp: la casa con martillo y escoba, recortada de la
 * carpeta `fotos` del proyecto.
 *
 * - "isotipo"  → solo la casa, a un tamaño fijo. Para la barra de navegación.
 * - "completo" → la casa con el nombre debajo. Para login y registro.
 *
 * El nombre va como TEXTO, no dentro de la imagen: así siempre coincide con
 * la marca, se ve nítido a cualquier tamaño y cambiarlo es editar una línea.
 */
export default function Logo({ size = 64, variante = 'isotipo' }) {
  if (variante === 'completo') {
    return (
      <div className="logo-completo">
        <img className="logo-completo-icono" src={isotipo} alt="" draggable={false} />
        <span className="logo-completo-nombre">CleanDerApp</span>
      </div>
    )
  }

  return (
    <img
      className="logo-isotipo"
      src={isotipo}
      alt="CleanDerApp"
      width={size}
      height={size}
      draggable={false}
    />
  )
}
