import { Save, Trash2 } from "lucide-react"
import { useState, type FormEvent } from "react"
import { Aviso } from "../components/Aviso"
import { Campo } from "../components/Campo"
import { Dialogo } from "../components/Dialogo"
import { useAuth } from "../hooks/useAuth"
import { useTitulo } from "../hooks/useTitulo"
import { textoMeta } from "../lib/texto"

export function Ajustes() {
  const { session, actualizarPerfil, actualizarCorreo, actualizarClave, eliminarCuenta } = useAuth()
  const metadata = session?.user.user_metadata
  const correoActual = session?.user.email ?? ""
  const [nombre, setNombre] = useState(() => textoMeta(metadata, "nombre"))
  const [apellido, setApellido] = useState(() => textoMeta(metadata, "apellido"))
  const [correo, setCorreo] = useState(correoActual)
  const [clave, setClave] = useState("")
  const [confirmacion, setConfirmacion] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [confirmarBaja, setConfirmarBaja] = useState(false)
  const [errorBaja, setErrorBaja] = useState<string | null>(null)
  const [borrando, setBorrando] = useState(false)
  useTitulo("Ajustes")

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const nuevoCorreo = correo.trim()
    const quiereClave = clave.length > 0 || confirmacion.length > 0
    if (!nombre.trim()) {
      setAviso(null)
      setError("Escribe tu nombre.")
      return
    }
    if (!nuevoCorreo.includes("@")) {
      setAviso(null)
      setError("Escribe un correo válido.")
      return
    }
    if (quiereClave && clave.length < 6) {
      setAviso(null)
      setError("La contraseña debe tener al menos 6 caracteres.")
      return
    }
    if (quiereClave && clave !== confirmacion) {
      setAviso(null)
      setError("Las contraseñas no coinciden.")
      return
    }

    setError(null)
    setAviso(null)
    setGuardando(true)

    const falloPerfil = await actualizarPerfil({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
    })
    if (falloPerfil) {
      setGuardando(false)
      setError(falloPerfil)
      return
    }

    let correoPendiente = false
    if (nuevoCorreo !== correoActual) {
      const resultado = await actualizarCorreo(nuevoCorreo)
      if (resultado.error) {
        setGuardando(false)
        setError(resultado.error)
        return
      }
      correoPendiente = resultado.pendiente
    }

    if (quiereClave) {
      const falloClave = await actualizarClave(clave)
      if (falloClave) {
        setGuardando(false)
        setError(falloClave)
        return
      }
      setClave("")
      setConfirmacion("")
    }

    setGuardando(false)
    setAviso(
      correoPendiente
        ? "Cambios guardados. Revisa el correo nuevo para confirmarlo."
        : "Cambios guardados éxitosamente.",
    )
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
        <Campo
          id="ajustes-correo"
          etiqueta="Correo"
          tipo="email"
          valor={correo}
          onChange={setCorreo}
          autoComplete="email"
          placeholder="ana@correo.com"
        />
        <Campo
          id="ajustes-clave"
          etiqueta="Nueva contraseña"
          nota="(opcional)"
          tipo="password"
          valor={clave}
          onChange={setClave}
          autoComplete="new-password"
          placeholder="Mínimo 6 caracteres"
        />
        <Campo
          id="ajustes-confirmacion"
          etiqueta="Confirmar contraseña"
          tipo="password"
          valor={confirmacion}
          onChange={setConfirmacion}
          autoComplete="new-password"
          placeholder="Repite la contraseña nueva"
        />
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
          disabled={guardando || borrando}
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
