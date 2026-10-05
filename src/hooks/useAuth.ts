import { useContext } from "react"
import { AuthContext, type AuthContextValue } from "../context/contextoAuth"

export function useAuth(): AuthContextValue {
  const valor = useContext(AuthContext)
  if (!valor) throw new Error("useAuth debe usarse dentro de AuthProvider")
  return valor
}
