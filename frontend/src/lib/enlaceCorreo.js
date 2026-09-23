/**
 * Lectura de los enlaces con los que vuelve alguien desde su correo.
 *
 * Aparte para que no dependa de nada: así se puede probar sola, que es la
 * pieza que más fácil se rompe y la que menos se puede comprobar a mano.
 */

/**
 * Forma nueva, la de las plantillas propias: el enlace apunta a la web y
 * trae un vale de un solo uso en la búsqueda (`?`).
 *
 *   ?token_hash=…&type=signup        confirmar la cuenta
 *   ?token_hash=…&type=recovery      he olvidado la clave
 *   ?token_hash=…&type=email_change  cambiar de correo
 *
 * Que el enlace lleve al propio dominio no es un capricho: un correo
 * firmado por cleanderapp.com que empuja a pinchar en otro sitio tiene la
 * forma exacta de un phishing, y los filtros lo mandan a no deseado.
 */
export function leerBusqueda(busqueda = '') {
  const params = new URLSearchParams(busqueda)
  const tokenHash = params.get('token_hash')
  if (!tokenHash) return { esEnlace: false, tipo: null, tokenHash: null }

  return { esEnlace: true, tipo: params.get('type'), tokenHash }
}

/**
 * Forma antigua, la de las plantillas de fábrica de Supabase: vuelve a la
 * raíz con la sesión ya hecha en el `#`. Se mantiene porque un correo
 * enviado antes del cambio puede abrirse después.
 *
 *   #access_token=…&refresh_token=…&type=recovery   he olvidado la clave
 *   #access_token=…&refresh_token=…&type=signup     confirmar la cuenta
 *   #error=access_denied&error_code=otp_expired&…   enlace caducado
 *   #/matches                                        la ruta normal de la app
 */
export function leerHash(hash = '') {
  if (!hash.includes('access_token=') && !hash.includes('error=')) {
    return { esEnlace: false, tipo: null, acceso: null, refresco: null }
  }

  const params = new URLSearchParams(hash.replace(/^#\/?/, ''))
  return {
    esEnlace: true,
    tipo: params.get('type'),
    acceso: params.get('access_token'),
    refresco: params.get('refresh_token'),
    hayError: params.has('error') || params.has('error_code'),
  }
}
