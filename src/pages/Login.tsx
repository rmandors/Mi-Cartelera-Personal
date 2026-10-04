import { LogIn } from "lucide-react"
import { useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import { AccesoMarco } from "../components/AccesoMarco"
import { Aviso } from "../components/Aviso"
import { Campo } from "../components/Campo"
import { useAuth } from "../hooks/useAuth"
import { useTitulo } from "../hooks/useTitulo"

export function Login() {
  const { iniciarSesion, configurado } = useAuth()
  const [correo, setCorreo] = useState("")
  const [clave, setClave] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  useTitulo("Entrar")

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!correo.includes("@") || clave.length < 6) {
      setError("Escribe un correo válido y una contraseña de al menos 6 caracteres.")
      return
    }
    setError(null)
    setEnviando(true)
    const mensaje = await iniciarSesion(correo.trim(), clave)
    setEnviando(false)
    if (mensaje) setError(mensaje)
  }

  return (
    <AccesoMarco>
      <form className="panel" onSubmit={(evento) => void enviar(evento)}>
        <h2>Entrar</h2>
        <p className="panel-texto">La sala solo abre con tu cuenta.</p>
        {!configurado ? (
          <Aviso>Falta configurar Supabase. Revisa las variables en .env.</Aviso>
        ) : null}
        {error ? <Aviso>{error}</Aviso> : null}
        <Campo
          id="login-correo"
          etiqueta="Correo"
          tipo="email"
          valor={correo}
          onChange={setCorreo}
          autoComplete="email"
        />
        <Campo
          id="login-clave"
          etiqueta="Contraseña"
          tipo="password"
          valor={clave}
          onChange={setClave}
          autoComplete="current-password"
        />
        <button className="boton" type="submit" disabled={enviando || !configurado}>
          <LogIn size={16} strokeWidth={1.75} aria-hidden />
          {enviando ? "Entrando…" : "Entrar"}
        </button>
        <p className="cambio">
          ¿Aún no tienes cuenta? <Link to="/registro">Regístrate</Link>
        </p>
      </form>
    </AccesoMarco>
  )
}
