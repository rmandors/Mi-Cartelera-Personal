import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { PantallaCarga } from "./PantallaCarga"

export function RutaProtegida() {
  const { session, cargando } = useAuth()
  if (cargando) return <PantallaCarga />
  if (!session) return <Navigate to="/login" replace />
  return <Outlet />
}

export function SoloInvitados() {
  const { session, cargando } = useAuth()
  if (cargando) return <PantallaCarga />
  if (session) return <Navigate to="/" replace />
  return <Outlet />
}
