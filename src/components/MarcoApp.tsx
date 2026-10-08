import { Outlet } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { nombreVisible } from "../lib/texto"
import { BarraApp } from "./BarraApp"

export function MarcoApp() {
  const { session, cerrarSesion } = useAuth()

  return (
    <div className="app">
      <BarraApp
        correo={session?.user.email ?? ""}
        nombre={nombreVisible(session?.user.user_metadata)}
        onSalir={() => {
          void cerrarSesion()
        }}
      />
      <main className="escenario">
        <Outlet />
      </main>
    </div>
  )
}
