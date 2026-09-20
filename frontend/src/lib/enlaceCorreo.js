/**
 * Lectura del `#` con el que vuelve un enlace de correo de Supabase.
 *
 * Aparte para que no dependa de nada: así se puede probar sola, que es la
 * pieza que más fácil se rompe y la que menos se puede comprobar a mano.
 *
 * Formas que llegan:
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
