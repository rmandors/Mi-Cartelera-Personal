import { useAuth } from "../hooks/useAuth"
import { useTitulo } from "../hooks/useTitulo"

export function Inicio() {
  const { session } = useAuth()
  useTitulo("Inicio")

  return (
    <section className="pagina">
      <p className="kicker">Sala</p>
      <h1>Mi Cartelera</h1>
      <p className="programa">Sesión de {session?.user.email}.</p>
    </section>
  )
}
