import { createClient } from '@supabase/supabase-js'
import { encogerFoto } from './imagen'
import { TAM_MAX_ALMACEN } from './constantes'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Las claves `anon` de Supabase son JWT y siempre empiezan por "eyJ".
// Así distinguimos una clave de verdad del texto de ejemplo del .env.
export const configuracionValida =
  Boolean(url) && url.startsWith('http') && Boolean(anonKey) && anonKey.startsWith('eyJ')

// Valores de reserva para que createClient no reviente y la app pueda
// mostrar un mensaje explicando qué falta, en vez de una pantalla en blanco.
export const supabase = createClient(
  configuracionValida ? url : 'https://pendiente-de-configurar.supabase.co',
  configuracionValida ? anonKey : 'pendiente-de-configurar',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      // GitHub Pages usa rutas con # y no hay login por redirección:
      // desactivarlo evita que Supabase intente leer el hash de la URL.
      detectSessionInUrl: false,
    },
  }
)

/**
 * Sube una foto al bucket `fotos` y devuelve su URL pública.
 *
 * Antes de subirla la encoge (ver `lib/imagen.js`). Sin eso, una foto de
 * móvil ocupa entre 3 y 5 MB y se descarga entera cada vez que alguien
 * desliza esa tarjeta, que es lo que agota el plan gratuito de Supabase.
 */
export async function subirFoto(file, usuarioId) {
  const foto = await encogerFoto(file)

  // Si sigue pasada de peso es que el navegador no supo abrirla y se ha
  // devuelto la original. Avisamos aquí, que el almacén la rechazaría con
  // un error en inglés y sin explicar nada.
  if (foto.size > TAM_MAX_ALMACEN) throw new Error('foto-sin-encoger')

  const extension = (foto.name.split('.').pop() || 'jpg').toLowerCase()
  const ruta = `${usuarioId}/perfil-${Date.now()}.${extension}`

  const { error } = await supabase.storage
    .from('fotos')
    // cacheControl corto a propósito: al borrar una cuenta, la copia que
    // guarda la red de distribución caduca en minutos en vez de en una hora.
    .upload(ruta, foto, { upsert: true, contentType: foto.type, cacheControl: '300' })

  if (error) throw error

  const { data } = supabase.storage.from('fotos').getPublicUrl(ruta)
  return data.publicUrl
}

/**
 * Borra todas las fotos de un usuario.
 *
 * Tiene que pasar por la API de Storage: Supabase prohíbe borrar de sus
 * tablas de almacenamiento con SQL, así que no puede hacerse dentro de
 * las funciones de la base de datos.
 *
 * Quien lo llama debe ser el dueño de la carpeta o la administración.
 */
export async function borrarFotosDe(usuarioId) {
  const { data, error } = await supabase.storage.from('fotos').list(usuarioId)
  if (error || !data?.length) return

  await supabase.storage
    .from('fotos')
    .remove(data.map((f) => `${usuarioId}/${f.name}`))
}
