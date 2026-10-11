import { createContext } from "react"
import type { Session } from "@supabase/supabase-js"

export interface AuthContextValue {
  session: Session | null
  cargando: boolean
  configurado: boolean
  registrarse: (
    correo: string,
    clave: string,
    perfil: { nombre: string; apellido: string },
  ) => Promise<{ error: string | null; pendiente: boolean }>
  iniciarSesion: (correo: string, clave: string) => Promise<string | null>
  actualizarPerfil: (perfil: { nombre: string; apellido: string }) => Promise<string | null>
  eliminarCuenta: () => Promise<string | null>
  cerrarSesion: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
