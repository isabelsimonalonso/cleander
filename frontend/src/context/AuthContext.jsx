import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [matchesNuevos, setMatchesNuevos] = useState(0)
  const [valoracionesPendientes, setValoracionesPendientes] = useState(0)
  const [denunciasResueltas, setDenunciasResueltas] = useState(0)

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

  /** Cuántas personas me piden valoración y aún no les he votado. */
  const refrescarValoraciones = useCallback(async () => {
    const { data, error } = await supabase.rpc('mis_matches')
    if (error || !Array.isArray(data)) {
      setValoracionesPendientes(0)
      return
    }
    setValoracionesPendientes(
      data.filter((m) => m.puedo_valorar && !m.mi_voto).length
    )
  }, [])

  /** Denuncias mías que la administración ya ha resuelto y aún no he visto. */
  const refrescarDenuncias = useCallback(async () => {
    const { data, error } = await supabase.rpc('denuncias_resueltas')
    setDenunciasResueltas(error ? 0 : (data ?? 0))
  }, [])

  /** Al abrir Mi perfil se dan por vistas y el aviso verde desaparece. */
  const marcarDenunciasVistas = useCallback(async (userId) => {
    if (!userId) return
    await supabase
      .from('perfiles')
      .update({ denuncias_vistas_en: new Date().toISOString() })
      .eq('id', userId)
    setDenunciasResueltas(0)
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
      if (data.session) {
        await refrescarMatchesNuevos()
        await refrescarValoraciones()
        await refrescarDenuncias()
      }
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
        if (nuevaSesion) {
          await refrescarMatchesNuevos()
          await refrescarValoraciones()
          await refrescarDenuncias()
        } else {
          setMatchesNuevos(0)
          setValoracionesPendientes(0)
          setDenunciasResueltas(0)
        }
        if (activo) setCargando(false)
      }, 0)
    })

    return () => {
      activo = false
      sub.subscription.unsubscribe()
    }
  }, [cargarPerfil, refrescarMatchesNuevos, refrescarValoraciones, refrescarDenuncias])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setPerfil(null)
    setSesion(null)
    setMatchesNuevos(0)
    setValoracionesPendientes(0)
    setDenunciasResueltas(0)
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
    valoracionesPendientes,
    refrescarValoraciones,
    denunciasResueltas,
    marcarDenunciasVistas,
  }

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
