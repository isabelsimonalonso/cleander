import { supabase } from './supabase'
import { leerHash } from './enlaceCorreo'

/**
 * Enlaces que llegan por correo.
 *
 * Supabase devuelve a quien pincha uno a la raíz del sitio con los datos en
 * el `#` de la URL. Aquí el `#` es donde HashRouter guarda la ruta, así que
 * hay que recogerlos y limpiarlos ANTES de que React arranque: en cuanto el
 * enrutador no reconozca esa «ruta», reescribe el `#` y se los lleva por
 * delante. Por eso el cliente lleva `detectSessionInUrl: false` y lo hacemos
 * a mano: es la única forma de controlar el orden.
 *
 * Devuelve el modo en el que debe abrirse la aplicación:
 *   'recuperar' → viene a poner una contraseña nueva
 *   'caducado'  → el enlace ya no valía; que pida otro
 *   'normal'    → todo lo demás
 */
export async function leerEnlaceDeCorreo() {
  const enlace = leerHash(window.location.hash)
  if (!enlace.esEnlace) return 'normal'

  // La URL se limpia pase lo que pase: ni un enlace caducado ni, mucho
  // menos, un token válido deben quedarse en la barra de direcciones.
  window.history.replaceState(null, '', window.location.pathname + window.location.search)

  if (!enlace.acceso || !enlace.refresco) {
    return enlace.tipo === 'recovery' || enlace.hayError ? 'caducado' : 'normal'
  }

  const { error } = await supabase.auth.setSession({
    access_token: enlace.acceso,
    refresh_token: enlace.refresco,
  })

  if (error) return enlace.tipo === 'recovery' ? 'caducado' : 'normal'

  // Confirmar la cuenta recién creada deja la sesión abierta y entra directa.
  return enlace.tipo === 'recovery' ? 'recuperar' : 'normal'
}
