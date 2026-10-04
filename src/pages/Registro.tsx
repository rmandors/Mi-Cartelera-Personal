import { UserPlus } from "lucide-react"
import { useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import { AccesoMarco } from "../components/AccesoMarco"
import { Aviso } from "../components/Aviso"
import { Campo } from "../components/Campo"
import { useAuth } from "../hooks/useAuth"
import { useTitulo } from "../hooks/useTitulo"

export function Registro() {
  const { registrarse, configurado } = useAuth()
  const [nombre, setNombre] = useState("")
  const [apellido, setApellido] = useState("")
  const [correo, setCorreo] = useState("")
  const [clave, setClave] = useState("")
  const [confirmacion, setConfirmacion] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pendiente, setPendiente] = useState(false)
  const [enviando, setEnviando] = useState(false)
  useTitulo("Registro")

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!nombre.trim()) {
      setError("Escribe tu nombre.")
      return
    }
    if (!correo.includes("@")) {
      setError("Escribe un correo válido.")
      return
    }
    if (clave.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.")
      return
    }
    if (clave !== confirmacion) {
      setError("Las contraseñas no coinciden.")
      return
    }
    setError(null)
    setPendiente(false)
    setEnviando(true)
    const resultado = await registrarse(correo.trim(), clave, {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
    })
    setEnviando(false)
    if (resultado.error) setError(resultado.error)
    if (resultado.pendiente) setPendiente(true)
  }

  return (
    <AccesoMarco>
      <form className="panel" onSubmit={(evento) => void enviar(evento)}>
        <h2>Crear cuenta</h2>
        {!configurado ? (
          <Aviso>Falta configurar Supabase. Revisa las variables en .env.</Aviso>
        ) : null}
        {error ? <Aviso>{error}</Aviso> : null}
        {pendiente ? (
          <Aviso tono="ok">
            Revisa tu correo para confirmar la cuenta. Si desactivaste la confirmación en Supabase,
            entra desde el login.
          </Aviso>
        ) : null}
        <div className="campos-par">
          <Campo
            id="registro-nombre"
            etiqueta="Nombre"
            tipo="text"
            valor={nombre}
            onChange={setNombre}
            autoComplete="given-name"
            placeholder="Ej. Ana"
          />
          <Campo
            id="registro-apellido"
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
          id="registro-correo"
          etiqueta="Correo"
          tipo="email"
          valor={correo}
          onChange={setCorreo}
          autoComplete="email"
          placeholder="ana@correo.com"
        />
        <Campo
          id="registro-clave"
          etiqueta="Contraseña"
          tipo="password"
          valor={clave}
          onChange={setClave}
          autoComplete="new-password"
          placeholder="Mínimo 6 caracteres"
        />
        <Campo
          id="registro-confirmacion"
          etiqueta="Confirmar contraseña"
          tipo="password"
          valor={confirmacion}
          onChange={setConfirmacion}
          autoComplete="new-password"
          placeholder="Repite tu contraseña"
        />
        <button className="boton" type="submit" disabled={enviando || !configurado}>
          <UserPlus size={16} strokeWidth={1.75} aria-hidden />
          {enviando ? "Creando…" : "Crear cuenta"}
        </button>
        <p className="cambio">
          ¿Ya tienes cuenta? <Link to="/login">Entra</Link>
        </p>
      </form>
    </AccesoMarco>
  )
}
