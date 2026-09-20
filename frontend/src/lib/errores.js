/**
 * Traductor de errores de Supabase.
 *
 * Supabase contesta siempre en inglés y con jerga técnica. Enseñar eso tal
 * cual en una aplicación bilingüe rompe la ilusión y no ayuda a nadie: quien
 * lee «Email not confirmed» no sabe que tiene un correo esperándole.
 *
 * Lo que no reconocemos se resuelve con una frase genérica, nunca con el
 * mensaje original: si es un fallo nuestro, no es asunto de quien lo sufre.
 */
const PATRONES = [
  [/invalid login credentials/i,        'credencialesMal'],
  [/email not confirmed/i,              'errSinConfirmar'],
  [/already registered|already exists/i,'errCorreoUsado'],
  [/password should be at least/i,      'errContrasenaCorta'],
  [/password.*(weak|compromised|pwned|leaked)/i, 'errContrasenaDebil'],
  [/same as the old|should be different/i, 'errContrasenaIgual'],
  [/invalid.*email|email address.*invalid/i, 'errCorreoInvalido'],
  [/rate limit|too many requests|for security purposes/i, 'errDemasiadosIntentos'],
  [/expired|invalid token|token has|otp/i, 'errEnlaceCaducado'],
  [/failed to fetch|network|timeout/i,  'errSinConexion'],
]

/**
 * Supabase no llama igual al texto del error según por dónde venga: el
 * cliente lo entrega en `message`, pero la respuesta cruda de Auth trae
 * `msg` y OAuth `error_description`. Miramos los tres.
 *
 * @param {{message?: string, msg?: string, error_description?: string}|null} error
 * @param {(clave: string) => string} t
 */
export function mensajeError(error, t) {
  if (!error) return ''
  const texto = error.message ?? error.msg ?? error.error_description ?? ''
  const clave = PATRONES.find(([re]) => re.test(texto))?.[1]
  return t(clave ?? 'errGenerico')
}
