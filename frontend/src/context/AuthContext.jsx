import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [matchesNuevos, setMatchesNuevos] = useState(0)

  const cargarPerfil = useCallback(async (userId) => {
    if (!userId) {
      setPerfil(null)
      return null
    }
    // RLS hace que esta consulta solo pueda devolver TU propia fila.
    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) console.error('Error cargando perfil:', error.message)
    setPerfil(data ?? null)
    return data ?? null
  }, [])

  /** Cuántos matches han aparecido desde la última vez que miró. */
  const refrescarMatchesNuevos = useCallback(async () => {
    const { data, error } = await supabase.rpc('matches_nuevos')
    if (error) {
      // Si aún no se ha ejecutado 04_avisos_matches.sql, no molestamos.
      setMatchesNuevos(0)
      return
    }
    setMatchesNuevos(data ?? 0)
  }, [])

  /** Al entrar en Matches se dan todos por vistos y el aviso desaparece. */
  const marcarMatchesVistos = useCallback(async (userId) => {
    if (!userId) return
    await supabase
      .from('perfiles')
      .update({ matches_vistos_en: new Date().toISOString() })
      .eq('id', userId)
    setMatchesNuevos(0)
  }, [])

  useEffect(() => {
    let activo = true

    supabase.auth.getSession().then(async ({ data }) => {
      if (!activo) return
      setSesion(data.session)
      await cargarPerfil(data.session?.user?.id)
      if (data.session) await refrescarMatchesNuevos()
      if (activo) setCargando(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_evento, nuevaSesion) => {
      if (!activo) return
      setSesion(nuevaSesion)
      // Ojo: llamar a supabase DENTRO de este callback puede bloquear el
      // cliente. Por eso la consulta se saca del callback con setTimeout(0).
      setTimeout(async () => {
        if (!activo) return
        await cargarPerfil(nuevaSesion?.user?.id)
        if (nuevaSesion) await refrescarMatchesNuevos()
        else setMatchesNuevos(0)
        if (activo) setCargando(false)
      }, 0)
    })

    return () => {
      activo = false
      sub.subscription.unsubscribe()
    }
  }, [cargarPerfil, refrescarMatchesNuevos])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setPerfil(null)
    setSesion(null)
    setMatchesNuevos(0)
  }, [])

  const refrescarPerfil = useCallback(
    () => cargarPerfil(sesion?.user?.id),
    [cargarPerfil, sesion]
  )

  const valor = {
    sesion,
    usuario: sesion?.user ?? null,
    perfil,
    rol: perfil?.rol ?? null,
    cargando,
    logout,
    refrescarPerfil,
    matchesNuevos,
    refrescarMatchesNuevos,
    marcarMatchesVistos,
  }

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
