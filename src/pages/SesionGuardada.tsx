import { Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { Aviso } from "../components/Aviso"
import { Dialogo } from "../components/Dialogo"
import { EstadoCarga } from "../components/EstadoCarga"
import { Poster } from "../components/Poster"
import { useTitulo } from "../hooks/useTitulo"
import { eliminarSesion, obtenerSesion, type SesionGuardada as Sesion } from "../lib/sesiones"
import { fechaCorta } from "../lib/texto"

export function SesionGuardada() {
  const { id: idRuta } = useParams()
  const id = Number(idRuta)
  const idValido = Number.isInteger(id)
  const navigate = useNavigate()
  const [sesion, setSesion] = useState<Sesion | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirmar, setConfirmar] = useState(false)
  const [borrando, setBorrando] = useState(false)
  const [errorBorrar, setErrorBorrar] = useState<string | null>(null)
  useTitulo(sesion?.nombre ?? "Noche guardada")

  useEffect(() => {
    if (!idValido) return
    let activo = true
    obtenerSesion(id).then(({ dato, error: fallo }) => {
      if (!activo) return
      setSesion(dato)
      setError(fallo)
      setCargando(false)
    })
    return () => {
      activo = false
    }
  }, [id, idValido])

  async function borrar() {
    if (!sesion) return
    setBorrando(true)
    setErrorBorrar(null)
    const resultado = await eliminarSesion(sesion.id)
    setBorrando(false)
    if (!resultado.ok) {
      setErrorBorrar(resultado.error)
      return
    }
    navigate("/noche")
  }

  return (
    <section className="pagina">
      <header className="encabezado">
        <p className="kicker">Sesión</p>
        <h1>{sesion?.nombre ?? "Noche guardada"}</h1>
      </header>
      <Link to="/noche" className="volver">
        Volver a Noche de película
      </Link>

      {idValido && cargando ? <EstadoCarga mensaje="Cargando la sesión…" /> : null}
      {error ? <Aviso>{error}</Aviso> : null}

      {(!idValido || !cargando) && !sesion ? (
        <div className="vacio">
          <h2>Esta noche no está.</h2>
          <p>No existe o no es de tu cuenta.</p>
        </div>
      ) : null}

      {sesion ? (
        <>
          <p className="programa">
            {fechaCorta(sesion.creadaEn)} · {sesion.tiempoDisponible} min disponibles ·{" "}
            {sesion.duracionTotal} min en total
          </p>
          <div className="boletos">
            {sesion.peliculas.map((pelicula) => (
              <article className="ticket" key={pelicula.id}>
                <div className="ticket-poster">
                  <Poster
                    url={pelicula.posterUrl}
                    titulo={pelicula.titulo}
                    tamano="boleto"
                    decorativo
                  />
                </div>
                <div className="ticket-cuerpo">
                  <p className="kicker">{pelicula.duracion} min</p>
                  <h2>{pelicula.titulo}</h2>
                  {pelicula.miListaId == null ? <Aviso>Ya no está en tu lista.</Aviso> : null}
                </div>
              </article>
            ))}
          </div>
          <div className="noche-grupo">
            <button className="boton peligro" type="button" onClick={() => setConfirmar(true)}>
              <Trash2 size={16} strokeWidth={1.75} aria-hidden />
              Borrar sesión
            </button>
          </div>
          <Dialogo
            abierto={confirmar}
            titulo="Borrar sesión"
            texto={`¿Borrar «${sesion.nombre}»? Las películas siguen en tu lista.`}
            confirmar={borrando ? "Borrando…" : "Borrar"}
            ocupado={borrando}
            error={errorBorrar}
            onConfirmar={() => void borrar()}
            onCerrar={() => {
              if (!borrando) setConfirmar(false)
            }}
          />
        </>
      ) : null}
    </section>
  )
}
