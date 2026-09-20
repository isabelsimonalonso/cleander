import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { TEXTOS } from './textos'

const IdiomaContext = createContext(null)

/** Idiomas disponibles. Añadir uno es añadir su columna en textos.js. */
export const IDIOMAS = [
  { codigo: 'es', nombre: 'Español', corto: 'ES' },
  { codigo: 'en', nombre: 'English', corto: 'EN' },
]

const CLAVE = 'cleanderapp-idioma'

/** Lo que tenga guardado; si no, el del navegador; si no, español. */
function idiomaInicial() {
  try {
    const guardado = localStorage.getItem(CLAVE)
    if (guardado && IDIOMAS.some((i) => i.codigo === guardado)) return guardado
  } catch {
    // Modo incógnito o almacenamiento bloqueado: seguimos con el del navegador
  }
  return navigator.language?.startsWith('en') ? 'en' : 'es'
}

export function IdiomaProvider({ children }) {
  const [idioma, setIdioma] = useState(idiomaInicial)

  useEffect(() => {
    document.documentElement.lang = idioma
    try {
      localStorage.setItem(CLAVE, idioma)
    } catch {
      // Si no se puede guardar, el idioma dura lo que la pestaña
    }
  }, [idioma])

  const valor = useMemo(() => {
    /**
     * Traduce una clave. Si falta en el idioma activo, cae al español
     * antes que a la clave cruda: mejor una frase en otro idioma que un
     * identificador suelto en pantalla.
     *
     * Admite sustituciones: t('saludo', { nombre: 'Ana' })
     */
    const t = (clave, valores) => {
      const texto = TEXTOS[idioma]?.[clave] ?? TEXTOS.es[clave] ?? clave
      if (!valores) return texto
      return Object.entries(valores).reduce(
        (acc, [k, v]) => acc.replaceAll(`{${k}}`, v),
        texto
      )
    }
    return { idioma, setIdioma, t }
  }, [idioma])

  return <IdiomaContext.Provider value={valor}>{children}</IdiomaContext.Provider>
}

export function useIdioma() {
  const ctx = useContext(IdiomaContext)
  if (!ctx) throw new Error('useIdioma debe usarse dentro de <IdiomaProvider>')
  return ctx
}
