import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  // Fallo temprano y con un mensaje claro: es el error nº1 al desplegar.
  console.error(
    'Faltan las variables de Supabase. Copia frontend/.env.example a ' +
    'frontend/.env y rellena VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.'
  )
}

export const supabase = createClient(url ?? '', anonKey ?? '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // GitHub Pages usa rutas con # y no hay login por redirección:
    // desactivarlo evita que Supabase intente leer el hash de la URL.
    detectSessionInUrl: false,
  },
})

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
