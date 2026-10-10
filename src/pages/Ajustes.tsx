import { Save, Trash2 } from "lucide-react"
import { useState, type FormEvent } from "react"
import { Aviso } from "../components/Aviso"
import { Campo } from "../components/Campo"
import { Dialogo } from "../components/Dialogo"
import { useAuth } from "../hooks/useAuth"
import { useTitulo } from "../hooks/useTitulo"
import { textoMeta } from "../lib/texto"

export function Ajustes() {
  const { session, actualizarPerfil, eliminarCuenta } = useAuth()
  const metadata = session?.user.user_metadata
  const [nombre, setNombre] = useState(() => textoMeta(metadata, "nombre"))
  const [apellido, setApellido] = useState(() => textoMeta(metadata, "apellido"))
  const [error, setError] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [confirmarBaja, setConfirmarBaja] = useState(false)
  const [errorBaja, setErrorBaja] = useState<string | null>(null)
  const [borrando, setBorrando] = useState(false)
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

  async function darDeBaja() {
    setErrorBaja(null)
    setBorrando(true)
    const mensaje = await eliminarCuenta()
    if (mensaje) {
      setBorrando(false)
      setErrorBaja(mensaje)
    }
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
          <button className="boton linea" type="submit" disabled={guardando || borrando}>
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

      <div className="ajustes-baja">
        <p className="kicker">Eliminar la cuenta</p>
        <p className="meta">Se borrará la cuenta y toda tu lista. No se puede deshacer.</p>
        <button
          type="button"
          className="boton peligro"
          onClick={() => {
            setErrorBaja(null)
            setConfirmarBaja(true)
          }}
          disabled={borrando}
        >
          <Trash2 size={16} strokeWidth={1.75} aria-hidden />
          Eliminar la cuenta
        </button>
      </div>
      <Dialogo
        abierto={confirmarBaja}
        titulo="Eliminar la cuenta"
        texto="Se borrará la cuenta y toda tu lista. No se puede deshacer."
        confirmar={borrando ? "Eliminando…" : "Eliminar la cuenta"}
        ocupado={borrando}
        error={errorBaja}
        onConfirmar={() => void darDeBaja()}
        onCerrar={() => {
          if (!borrando) setConfirmarBaja(false)
        }}
      />
    </section>
  )
}
