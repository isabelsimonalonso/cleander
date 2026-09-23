import { supabase } from './supabase'
import { leerBusqueda, leerHash } from './enlaceCorreo'

/**
 * Enlaces que llegan por correo.
 *
 * Hay dos formas, y las dos se resuelven aquí, antes de montar React:
 *
 * - La propia, la de las plantillas de `supabase/plantillas-correo/`: el
 *   enlace apunta a cleanderapp.com con un vale en la búsqueda, y se canjea
 *   con `verifyOtp`.
 * - La de fábrica de Supabase, que devuelve a la raíz con la sesión hecha en
 *   el `#`. Aquí el `#` es donde HashRouter guarda la ruta, así que hay que
 *   recogerla ANTES de que React arranque: en cuanto el enrutador no
 *   reconozca esa «ruta», reescribe el `#` y se la lleva por delante. Por eso
 *   el cliente lleva `detectSessionInUrl: false` y lo hacemos a mano: es la
 *   única forma de controlar el orden.
 *
 * Devuelve el modo en el que debe abrirse la aplicación:
 *   'recuperar' → viene a poner una contraseña nueva
 *   'caducado'  → el enlace ya no valía; que pida otro
 *   'normal'    → todo lo demás
 */
export async function leerEnlaceDeCorreo() {
  const vale = leerBusqueda(window.location.search)
  if (vale.esEnlace) return canjearVale(vale)

  const enlace = leerHash(window.location.hash)
  if (!enlace.esEnlace) return 'normal'

  // La URL se limpia pase lo que pase: ni un enlace caducado ni, mucho
  // menos, un token válido deben quedarse en la barra de direcciones.
  limpiarUrl(window.location.search)

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

/**
 * Canjea el vale de un solo uso por una sesión. Se limpia la URL primero,
 * por lo mismo de siempre: que no quede nada aprovechable a la vista.
 */
async function canjearVale({ tokenHash, tipo }) {
  limpiarUrl('')

  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: tipo || 'signup',
  })

  if (error) return tipo === 'recovery' ? 'caducado' : 'normal'

  return tipo === 'recovery' ? 'recuperar' : 'normal'
}

function limpiarUrl(busqueda) {
  window.history.replaceState(null, '', window.location.pathname + busqueda)
}
