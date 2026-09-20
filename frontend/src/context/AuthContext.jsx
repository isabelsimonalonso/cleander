import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [cargando, setCargando] = useState(true)

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

  useEffect(() => {
    let activo = true

    supabase.auth.getSession().then(async ({ data }) => {
      if (!activo) return
      setSesion(data.session)
      await cargarPerfil(data.session?.user?.id)
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
        if (activo) setCargando(false)
      }, 0)
    })

    return () => {
      activo = false
      sub.subscription.unsubscribe()
    }
  }, [cargarPerfil])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setPerfil(null)
    setSesion(null)
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
  }

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
