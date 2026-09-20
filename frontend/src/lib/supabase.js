import { createClient } from '@supabase/supabase-js'

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

/** Sube una foto al bucket `fotos` y devuelve su URL pública. */
export async function subirFoto(file, usuarioId) {
  const extension = (file.name.split('.').pop() || 'jpg').toLowerCase()
  const ruta = `${usuarioId}/perfil-${Date.now()}.${extension}`

  const { error } = await supabase.storage
    .from('fotos')
    .upload(ruta, file, { upsert: true, contentType: file.type })

  if (error) throw error

  const { data } = supabase.storage.from('fotos').getPublicUrl(ruta)
  return data.publicUrl
}
