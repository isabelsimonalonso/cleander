/**
 * Encoge la foto en el navegador antes de subirla.
 *
 * Por qué, con números: una foto de móvil pesa entre 3 y 5 MB. El plan
 * gratuito de Supabase da 1 GB de almacenamiento y 5 GB de tráfico al mes,
 * y cada tarjeta que alguien desliza se descarga la foto entera. Sin
 * encoger, trescientos usuarios llenan el almacén y unos pocos días de uso
 * se comen el tráfico del mes.
 *
 * Encogida a 1000 píxeles y calidad 80 se queda en unos 150 KB: veinte
 * veces menos. Y la web va mucho más suelta en el móvil, que es donde se
 * va a usar.
 *
 * Se hace aquí y no en el servidor porque no hay servidor: lo que no haga
 * el navegador, no lo hace nadie.
 */

/** Lado mayor, en píxeles. Suficiente para una tarjeta y para el zoom. */
export const LADO_MAX = 1000

/** Calidad del JPEG. Por debajo de 0,75 se empieza a notar en las caras. */
export const CALIDAD = 0.8

/**
 * Devuelve una versión encogida del archivo, o el archivo original si el
 * navegador no sabe abrirlo.
 *
 * Lo segundo pasa de verdad: los iPhone hacen fotos en HEIC y solo Safari
 * las sabe decodificar. En ese caso se sube tal cual, que para eso el
 * almacén acepta HEIC y tiene su propio tope de 5 MB.
 */
export async function encogerFoto(archivo) {
  try {
    // `from-image` respeta la orientación que trae la foto. Sin esto, las
    // hechas en vertical con el móvil se suben tumbadas.
    const bitmap = await createImageBitmap(archivo, { imageOrientation: 'from-image' })

    const escala = Math.min(1, LADO_MAX / Math.max(bitmap.width, bitmap.height))
    const ancho = Math.round(bitmap.width * escala)
    const alto = Math.round(bitmap.height * escala)

    const lienzo = document.createElement('canvas')
    lienzo.width = ancho
    lienzo.height = alto

    const ctx = lienzo.getContext('2d')
    // Fondo blanco: si la original es un PNG con transparencia, al pasar a
    // JPEG lo transparente se volvería negro.
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, ancho, alto)
    ctx.drawImage(bitmap, 0, 0, ancho, alto)
    bitmap.close?.()

    const blob = await new Promise((listo) =>
      lienzo.toBlob(listo, 'image/jpeg', CALIDAD)
    )
    if (!blob) return archivo

    // Si la original ya era más pequeña que el resultado, no tiene sentido
    // cambiarla: pasa con imágenes ya optimizadas o con capturas pequeñas.
    if (blob.size >= archivo.size) return archivo

    return new File([blob], 'perfil.jpg', { type: 'image/jpeg' })
  } catch {
    return archivo
  }
}
