import { describe, it, expect } from 'vitest'
import { leerBusqueda, leerHash } from '../enlaceCorreo'

/**
 * Esta pieza decide si alguien entra en su cuenta o se queda fuera, y no hay
 * forma cómoda de probarla a mano: haría falta un correo real por cada caso.
 * Por eso es la primera que merece pruebas.
 */

describe('leerBusqueda · los enlaces de nuestras plantillas', () => {
  it('reconoce el de confirmar la cuenta', () => {
    const r = leerBusqueda('?token_hash=abc123&type=signup')
    expect(r).toEqual({ esEnlace: true, tipo: 'signup', tokenHash: 'abc123' })
  })

  it('reconoce el de recuperar la contraseña', () => {
    expect(leerBusqueda('?token_hash=xyz&type=recovery').tipo).toBe('recovery')
  })

  it('reconoce el de cambiar de correo', () => {
    expect(leerBusqueda('?token_hash=xyz&type=email_change').tipo).toBe('email_change')
  })

  it('no confunde una búsqueda cualquiera con un enlace de correo', () => {
    expect(leerBusqueda('?utm_source=instagram').esEnlace).toBe(false)
    expect(leerBusqueda('').esEnlace).toBe(false)
    expect(leerBusqueda().esEnlace).toBe(false)
  })

  it('aguanta un vale sin tipo: se tratará como confirmación', () => {
    const r = leerBusqueda('?token_hash=abc')
    expect(r.esEnlace).toBe(true)
    expect(r.tipo).toBe(null)
  })
})

describe('leerHash · los enlaces de las plantillas viejas de Supabase', () => {
  it('saca la sesión de un enlace de recuperación', () => {
    const r = leerHash('#access_token=AAA&refresh_token=BBB&type=recovery')
    expect(r.esEnlace).toBe(true)
    expect(r.tipo).toBe('recovery')
    expect(r.acceso).toBe('AAA')
    expect(r.refresco).toBe('BBB')
  })

  it('detecta un enlace caducado', () => {
    const r = leerHash('#error=access_denied&error_code=otp_expired')
    expect(r.esEnlace).toBe(true)
    expect(r.hayError).toBe(true)
    expect(r.acceso).toBe(null)
  })

  it('no toma una ruta normal de la aplicación por un enlace de correo', () => {
    expect(leerHash('#/matches').esEnlace).toBe(false)
    expect(leerHash('#/perfil').esEnlace).toBe(false)
    expect(leerHash('').esEnlace).toBe(false)
  })
})
