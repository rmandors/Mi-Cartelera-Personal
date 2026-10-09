import { Save, Trash2 } from "lucide-react"
import { useEffect, useState, type FormEvent } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { Aviso } from "../components/Aviso"
import { Dialogo } from "../components/Dialogo"
import { EstadoCarga } from "../components/EstadoCarga"
import { Estrellas } from "../components/Estrellas"
import { Poster } from "../components/Poster"
import { SelectorEstado } from "../components/SelectorEstado"
import { useTitulo } from "../hooks/useTitulo"
import { actualizarTitulo, eliminarTitulo, obtenerTitulo } from "../lib/lista"
import { fechaCorta } from "../lib/texto"
import { obtenerDetalle } from "../lib/tmdb"
import {
  ETIQUETA_TIPO,
  type EstadoVisualizacion,
  type FichaTmdb,
  type ItemLista,
} from "../types/catalogo"

export function Detalle() {
  const { id: idRuta } = useParams()
  const navigate = useNavigate()
  const id = Number(idRuta)
  const [item, setItem] = useState<ItemLista | null>(null)
  const [ficha, setFicha] = useState<FichaTmdb | null>(null)
  const [estado, setEstado] = useState<EstadoVisualizacion>("por_ver")
  const [nota, setNota] = useState<number | null>(null)
  const [comentario, setComentario] = useState("")
  const [cargando, setCargando] = useState(true)
  const [cargandoTmdb, setCargandoTmdb] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [falloTmdb, setFalloTmdb] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [confirmarQuitar, setConfirmarQuitar] = useState(false)
  const [quitando, setQuitando] = useState(false)
  const [errorQuitar, setErrorQuitar] = useState<string | null>(null)
  useTitulo(item?.titulo ?? "Ficha")

  const idInvalido = !Number.isInteger(id) || id <= 0

  useEffect(() => {
    if (idInvalido) return

    let cancelado = false

    async function cargar() {
      setCargando(true)
      setError(null)
      setFalloTmdb(null)
      const { dato, error: fallo } = await obtenerTitulo(id)
      if (cancelado) return
      if (fallo || !dato) {
        setCargando(false)
        setError(fallo ?? "Ese título no está en tu lista.")
        return
      }
      setItem(dato)
      setEstado(dato.estado)
      setNota(dato.calificacion_personal)
      setComentario(dato.comentario ?? "")
      setCargando(false)
      setCargandoTmdb(true)
      try {
        const detalle = await obtenerDetalle(dato.tipo_contenido, dato.tmdb_id)
        if (!cancelado) setFicha(detalle)
      } catch (falloDetalle) {
        if (!cancelado) {
          setFalloTmdb(
            falloDetalle instanceof Error
              ? falloDetalle.message
              : "No se pudo cargar la ficha de TMDB.",
          )
        }
      } finally {
        if (!cancelado) setCargandoTmdb(false)
      }
    }

    void cargar()
    return () => {
      cancelado = true
    }
  }, [id, idInvalido])

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!item) return
    setGuardando(true)
    setAviso(null)
    setError(null)
    const resultado = await actualizarTitulo(item.id, {
      estado,
      calificacion_personal: nota,
      comentario: comentario.trim() || null,
    })
    setGuardando(false)
    if (!resultado.ok) {
      setError(resultado.error)
      return
    }
    setItem({
      ...item,
      estado,
      calificacion_personal: nota,
      comentario: comentario.trim() || null,
    })
    setAviso("Cambios guardados éxitosamente.")
  }

  async function quitar() {
    if (!item) return
    setErrorQuitar(null)
    setQuitando(true)
    const resultado = await eliminarTitulo(item.id)
    setQuitando(false)
    if (!resultado.ok) {
      setErrorQuitar(resultado.error)
      return
    }
    navigate("/")
  }

  if (idInvalido) {
    return (
      <section className="pagina">
        <Link to="/" className="volver">
          ← Mi lista
        </Link>
        <Aviso>Ese título no está en tu lista.</Aviso>
      </section>
    )
  }

  if (cargando) {
    return (
      <section className="pagina">
        <EstadoCarga mensaje="Abriendo la ficha…" />
      </section>
    )
  }

  if (!item) {
    return (
      <section className="pagina">
        <Link to="/" className="volver">
          ← Mi lista
        </Link>
        <Aviso>{error ?? "Ese título no está en tu lista."}</Aviso>
      </section>
    )
  }

  const anio = ficha?.anio

  return (
    <section className="pagina">
      <Link to="/" className="volver">
        ← Mi lista
      </Link>
      <article className="ficha">
        <Poster url={item.poster_url} titulo={item.titulo} tamano="ficha" />
        <div className="ficha-texto">
          <p className="kicker">
            {ETIQUETA_TIPO[item.tipo_contenido]}
            {anio ? ` · ${anio}` : ""}
          </p>
          <h1>{item.titulo}</h1>
          <p className="meta">En tu lista desde {fechaCorta(item.fecha_agregado)}</p>

          {ficha?.calificacionOficial != null ? (
            <p className="sello">TMDB {ficha.calificacionOficial.toFixed(1)} / 10</p>
          ) : null}

          {cargandoTmdb ? <EstadoCarga mensaje="Pidiendo sinopsis y reparto…" /> : null}
          {falloTmdb ? <Aviso>{falloTmdb}</Aviso> : null}

          <h3>Sinopsis</h3>
          <p className="sinopsis">{ficha?.sinopsis || "Sin sinopsis disponible."}</p>

          <h3>Reparto</h3>
          {ficha && ficha.elenco.length > 0 ? (
            <ul className="elenco">
              {ficha.elenco.map((persona) => (
                <li key={`${persona.nombre}-${persona.personaje}`}>
                  <strong>{persona.nombre}</strong>
                  <span>{persona.personaje}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="meta">
              {cargandoTmdb ? "Cargando elenco…" : "TMDB no devolvió elenco para este título."}
            </p>
          )}

          <form className="copia" onSubmit={(evento) => void guardar(evento)}>
            <h3>Tu copia</h3>
            <p className="panel-texto">
              El estado, la nota y el comentario son tuyos. No cambian la ficha de TMDB.
            </p>
            {error ? <Aviso>{error}</Aviso> : null}
            <SelectorEstado valor={estado} onChange={setEstado} etiqueta="Estado" />
            <div className="campo">
              <span>Calificación personal</span>
              <Estrellas valor={nota} onChange={setNota} />
            </div>
            <label className="campo" htmlFor="comentario">
              <span>Comentario</span>
              <textarea
                id="comentario"
                value={comentario}
                maxLength={600}
                rows={4}
                placeholder="Una nota para ti, cuando la vuelvas a encontrar."
                onChange={(evento) => setComentario(evento.target.value)}
              />
            </label>
            <div className="ticket-acciones copia-acciones">
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
              <button
                type="button"
                className="boton peligro"
                onClick={() => {
                  setErrorQuitar(null)
                  setConfirmarQuitar(true)
                }}
              >
                <Trash2 size={16} strokeWidth={1.75} aria-hidden />
                Eliminar de mi lista
              </button>
            </div>
          </form>
        </div>
      </article>
      <Dialogo
        abierto={confirmarQuitar}
        titulo="Quitar de la lista"
        texto={item ? `¿Quitar «${item.titulo}» de tu lista?` : ""}
        confirmar={quitando ? "Quitando…" : "Quitar"}
        ocupado={quitando}
        error={errorQuitar}
        onConfirmar={() => void quitar()}
        onCerrar={() => {
          if (!quitando) setConfirmarQuitar(false)
        }}
      />
    </section>
  )
}
