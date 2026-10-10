import { Save } from "lucide-react"
import { useState, type FormEvent } from "react"
import { Aviso } from "../components/Aviso"
import { Campo } from "../components/Campo"
import { useAuth } from "../hooks/useAuth"
import { useTitulo } from "../hooks/useTitulo"
import { textoMeta } from "../lib/texto"

export function Ajustes() {
  const { session, actualizarPerfil } = useAuth()
  const metadata = session?.user.user_metadata
  const [nombre, setNombre] = useState(() => textoMeta(metadata, "nombre"))
  const [apellido, setApellido] = useState(() => textoMeta(metadata, "apellido"))
  const [error, setError] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  useTitulo("Ajustes")

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!nombre.trim()) {
      setAviso(null)
      setError("Escribe tu nombre.")
      return
    }
    setError(null)
    setAviso(null)
    setGuardando(true)
    const mensaje = await actualizarPerfil({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
    })
    setGuardando(false)
    if (mensaje) {
      setError(mensaje)
      return
    }
    setAviso("Cambios guardados éxitosamente.")
  }

  return (
    <section className="pagina ajustes">
      <header className="encabezado">
        <p className="kicker">Cuenta</p>
        <h2>Mis Ajustes</h2>
      </header>

      <form className="ajustes-bloque" onSubmit={(evento) => void guardar(evento)}>
        {error ? <Aviso>{error}</Aviso> : null}
        <div className="campos-par">
          <Campo
            id="ajustes-nombre"
            etiqueta="Nombre"
            tipo="text"
            valor={nombre}
            onChange={setNombre}
            autoComplete="given-name"
            placeholder="Ej. Ana"
          />
          <Campo
            id="ajustes-apellido"
            etiqueta="Apellido"
            nota="(opcional)"
            tipo="text"
            valor={apellido}
            onChange={setApellido}
            autoComplete="family-name"
            placeholder="Ej. Ruiz"
          />
        </div>
        <div className="guardar-bloque">
          <button className="boton linea" type="submit" disabled={guardando}>
            <Save size={16} strokeWidth={1.75} aria-hidden />
            {guardando ? "Guardando…" : "Guardar cambios"}
          </button>
          {aviso ? (
            <p className="nota-ok" role="status">
              {aviso}
            </p>
          ) : null}
        </div>
      </form>
    </section>
  )
}
