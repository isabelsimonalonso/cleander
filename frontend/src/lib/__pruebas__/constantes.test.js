import { describe, it, expect } from 'vitest'
import { contrasenaValida, telefonoValido } from '../constantes'

/**
 * Las dos validaciones que le dicen «no» a alguien que se está registrando.
 * Si se aflojan sin querer, entra gente con contraseñas débiles; si se
 * aprietan, se queda fuera gente legítima. Ninguna de las dos se nota mirando.
 */

describe('contrasenaValida', () => {
  it('acepta ocho o más con letras y números', () => {
    expect(contrasenaValida('abcd1234')).toBe(true)
    expect(contrasenaValida('Caracola2026')).toBe(true)
  })

  it('rechaza las cortas aunque estén bien formadas', () => {
    expect(contrasenaValida('abc123')).toBe(false)
  })

  it('rechaza las que son solo letras o solo números', () => {
    expect(contrasenaValida('contrasena')).toBe(false)
    expect(contrasenaValida('12345678')).toBe(false)
  })

  it('no revienta si no le llega nada', () => {
    expect(contrasenaValida('')).toBe(false)
    expect(contrasenaValida(null)).toBe(false)
    expect(contrasenaValida(undefined)).toBe(false)
  })
})

describe('telefonoValido', () => {
  it('acepta los formatos que escribe la gente', () => {
    expect(telefonoValido('+34600000000')).toBe(true)
    expect(telefonoValido('600 00 00 00')).toBe(true)
    expect(telefonoValido(' 600000000 ')).toBe(true)
  })

  it('rechaza lo que no es un teléfono', () => {
    expect(telefonoValido('600')).toBe(false)
    expect(telefonoValido('llámame')).toBe(false)
    expect(telefonoValido('')).toBe(false)
    expect(telefonoValido(null)).toBe(false)
  })
})
