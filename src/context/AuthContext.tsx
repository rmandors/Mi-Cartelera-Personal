import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import { mensajeAuth } from "../lib/errores"
import { supabase, supabaseConfigurado } from "../lib/supabase"
import { metadatosPerfil } from "../lib/texto"
import { AuthContext, type AuthContextValue } from "./contextoAuth"

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<AuthContextValue["session"]>(null)
  const [cargando, setCargando] = useState(supabaseConfigurado)

  useEffect(() => {
    if (!supabase) return

    let activo = true
    void supabase.auth.getSession().then(({ data }) => {
      if (!activo) return
      setSession(data.session)
      setCargando(false)
    })

    const { data } = supabase.auth.onAuthStateChange((_evento, siguiente) => {
      setSession(siguiente)
      setCargando(false)
    })

    return () => {
      activo = false
      data.subscription.unsubscribe()
    }
  }, [])

  const iniciarSesion = useCallback(async (correo: string, clave: string) => {
    if (!supabase) return "Supabase no está configurado."
    const { error } = await supabase.auth.signInWithPassword({ email: correo, password: clave })
    return error ? mensajeAuth(error.message) : null
  }, [])

  const registrarse = useCallback(async (
    correo: string,
    clave: string,
    perfil: { nombre: string; apellido: string },
  ) => {
    if (!supabase) return { error: "Supabase no está configurado.", pendiente: false }
    const { data, error } = await supabase.auth.signUp({
      email: correo,
      password: clave,
      options: { data: metadatosPerfil(perfil.nombre, perfil.apellido) },
    })
    if (error) return { error: mensajeAuth(error.message), pendiente: false }
    if (!data.session) return { error: null, pendiente: true }
    return { error: null, pendiente: false }
  }, [])



  const cerrarSesion = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
  }, [])

  const valor = useMemo<AuthContextValue>(
    () => ({
      session,
      cargando,
      configurado: supabaseConfigurado,
      registrarse,
      iniciarSesion,
      cerrarSesion,
    }),
    [session, cargando, registrarse, iniciarSesion, cerrarSesion],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}
