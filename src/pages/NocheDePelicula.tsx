import { Trash2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Aviso } from "../components/Aviso"
import { CandidataNoche } from "../components/CandidataNoche"
import { Dialogo } from "../components/Dialogo"
import { EstadoCarga } from "../components/EstadoCarga"
import { Poster } from "../components/Poster"
import { ResumenSesion, type ElegidaNoche } from "../components/ResumenSesion"
import { SelectorTiempo } from "../components/SelectorTiempo"
import {
  PAUSA_MINUTOS,
  cabe,
  duracionTotal,
  evaluarAgregado,
  llenarNoche,
  peliculasQueCaben,
  validarNombre,
  validarTiempo,
  type Candidata,
  type MotivoAgregado,
  type MotivoNoDisponible,
} from "../dominio/noche"
import { useDuraciones } from "../hooks/useDuraciones"
import { useTitulo } from "../hooks/useTitulo"
import { listarColeccion } from "../lib/lista"
import {
  eliminarSesion,
  guardarSesion,
  listarSesiones,
  type SesionGuardada as Sesion,
} from "../lib/sesiones"
import { fechaCorta } from "../lib/texto"
import type { ItemLista } from "../types/catalogo"

const FRASE_TIEMPO = "El tiempo tiene que ser un entero de 30 a 600 minutos."

function fraseNoDisponible(
  motivo: MotivoNoDisponible,
  duracion: number | null,
  tiempo: number,
): string {
  if (motivo === "sin_duracion") {
    return "No se puede agregar: TMDB no tiene una duración para esta película."
  }
  return `Dura ${duracion ?? 0} min y tu tiempo es ${tiempo} min.`
}

function fraseAgregado(motivo: MotivoAgregado, totalIntentado: number, tiempo: number): string {
  if (motivo === "duplicada") return "Esa película ya está en esta sesión."
  if (motivo === "no_cabe") {
    return `No cabe en lo que queda: la noche quedaría en ${totalIntentado} min y tienes ${tiempo}.`
  }
  if (motivo === "sin_duracion") {
    return "No se puede agregar: TMDB no tiene una duración para esta película."
  }
  return FRASE_TIEMPO
}

export function NocheDePelicula() {
  const [items, setItems] = useState<ItemLista[]>([])
  const [cargandoLista, setCargandoLista] = useState(true)
  const [errorLista, setErrorLista] = useState<string | null>(null)
  const [tiempoTexto, setTiempoTexto] = useState("")
  const [tiempo, setTiempo] = useState<number | null>(null)
  const [errorTiempo, setErrorTiempo] = useState<string | null>(null)
  const [elegidas, setElegidas] = useState<ElegidaNoche[]>([])
  const [avisoAgregar, setAvisoAgregar] = useState<string | null>(null)
  const [avisoTono, setAvisoTono] = useState<"error" | "ok">("error")
  const [avisoId, setAvisoId] = useState<number | null>(null)
  const [nombre, setNombre] = useState("")
  const [guardando, setGuardando] = useState(false)
  const [sesiones, setSesiones] = useState<Sesion[]>([])
  const [cargandoSesiones, setCargandoSesiones] = useState(true)
  const [errorSesiones, setErrorSesiones] = useState<string | null>(null)
  const [pendienteBorrar, setPendienteBorrar] = useState<Sesion | null>(null)
  const [borrando, setBorrando] = useState(false)
  const [errorBorrar, setErrorBorrar] = useState<string | null>(null)
  useTitulo("Noche de película")

  useEffect(() => {
    let activo = true
    listarColeccion().then(({ datos, error }) => {
      if (!activo) return
      setItems(datos)
      setErrorLista(error)
      setCargandoLista(false)
    })
    return () => {
      activo = false
    }
  }, [])

  useEffect(() => {
    let activo = true
    listarSesiones().then(({ datos, error }) => {
      if (!activo) return
      setSesiones(datos)
      setErrorSesiones(error)
      setCargandoSesiones(false)
    })
    return () => {
      activo = false
    }
  }, [])

  const porVer = useMemo(
    () => items.filter((item) => item.tipo_contenido === "pelicula" && item.estado === "por_ver"),
    [items],
  )
  const ids = useMemo(() => porVer.map((item) => item.tmdb_id), [porVer])
  const duraciones = useDuraciones(ids, tiempo !== null && porVer.length > 0)
  const porIdLista = useMemo(() => new Map(porVer.map((item) => [item.id, item])), [porVer])

  function confirmarTiempo() {
    const resultado = validarTiempo(tiempoTexto)
    if (!resultado.ok) {
      setTiempo(null)
      setElegidas([])
      setAvisoAgregar(null)
      setAvisoId(null)
      setErrorTiempo(FRASE_TIEMPO)
      return
    }
    setErrorTiempo(null)
    setTiempo(resultado.minutos)
    const sigueCabiendo = cabe(
      resultado.minutos,
      elegidas.map((pelicula) => pelicula.duracion),
      PAUSA_MINUTOS,
    )
    if (!sigueCabiendo) {
      setElegidas([])
      setAvisoId(null)
      setAvisoTono("error")
      setAvisoAgregar("Con este tiempo la selección anterior ya no cabe.")
      return
    }
    setAvisoAgregar(null)
    setAvisoId(null)
  }

  function agregar(pelicula: Candidata) {
    if (tiempo === null) return
    const resultado = evaluarAgregado(
      tiempo,
      elegidas,
      { id: pelicula.id, duracion: pelicula.duracion },
      PAUSA_MINUTOS,
    )
    if (!resultado.ok || pelicula.duracion == null) {
      const totalIntentado = duracionTotal(
        [...elegidas.map((elegida) => elegida.duracion), pelicula.duracion ?? 0],
        PAUSA_MINUTOS,
      )
      setAvisoId(pelicula.id)
      setAvisoTono("error")
      setAvisoAgregar(fraseAgregado(resultado.motivo ?? "sin_duracion", totalIntentado, tiempo))
      return
    }
    setAvisoId(null)
    setAvisoAgregar(null)
    setElegidas((actual) => [
      ...actual,
      { id: pelicula.id, titulo: pelicula.titulo, duracion: pelicula.duracion ?? 0 },
    ])
  }

  function llenar() {
    if (tiempo === null) return
    const propuesta = llenarNoche(tiempo, candidatas, PAUSA_MINUTOS)
    if (propuesta.length === 0) {
      setAvisoTono("error")
      setAvisoId(null)
      setAvisoAgregar("Ninguna de estas películas cabe en el tiempo.")
      return
    }
    setElegidas(
      propuesta.map((pelicula) => ({
        id: pelicula.id,
        titulo: pelicula.titulo,
        duracion: pelicula.duracion ?? 0,
      })),
    )
    setAvisoTono("ok")
    setAvisoId(null)
    setAvisoAgregar(
      propuesta.length === 1
        ? "Armé la noche con 1 película."
        : `Armé la noche con ${propuesta.length} películas.`,
    )
  }

  function quitar(id: number) {
    setElegidas((actual) => actual.filter((pelicula) => pelicula.id !== id))
    if (avisoId === id) {
      setAvisoId(null)
      setAvisoAgregar(null)
    }
  }

  async function guardar() {
    if (tiempo === null) return
    const nombreValido = validarNombre(nombre)
    if (!nombreValido.ok) {
      setAvisoTono("error")
      setAvisoAgregar(
        nombreValido.motivo === "largo"
          ? "El nombre puede tener hasta 60 caracteres."
          : "Ponle un nombre a la noche.",
      )
      return
    }
    if (elegidas.length === 0) {
      setAvisoTono("error")
      setAvisoAgregar("La noche necesita al menos una película.")
      return
    }

    const peliculas = elegidas.map((pelicula, indice) => {
      const item = porIdLista.get(pelicula.id)
      return {
        miListaId: pelicula.id,
        tmdbId: item?.tmdb_id ?? 0,
        titulo: pelicula.titulo,
        posterUrl: item?.poster_url ?? null,
        duracion: pelicula.duracion,
        posicion: indice + 1,
      }
    })
    if (peliculas.some((pelicula) => pelicula.tmdbId <= 0)) {
      setAvisoTono("error")
      setAvisoAgregar("No se pudo identificar una película de tu lista.")
      return
    }

    setGuardando(true)
    const resultado = await guardarSesion({
      nombre: nombreValido.nombre,
      tiempoDisponible: tiempo,
      duracionTotal: duracionTotal(
        elegidas.map((pelicula) => pelicula.duracion),
        PAUSA_MINUTOS,
      ),
      peliculas,
    })
    setGuardando(false)
    if (!resultado.ok) {
      setAvisoTono("error")
      setAvisoAgregar(resultado.error ?? "No se pudo guardar la sesión.")
      return
    }

    setElegidas([])
    setNombre("")
    setAvisoId(null)
    setAvisoTono("ok")
    setAvisoAgregar("La noche quedó guardada. Tus películas siguen por ver.")
    const lista = await listarSesiones()
    setSesiones(lista.datos)
    setErrorSesiones(lista.error)
    setCargandoSesiones(false)
  }

  async function borrarSesion() {
    if (!pendienteBorrar) return
    setBorrando(true)
    setErrorBorrar(null)
    const resultado = await eliminarSesion(pendienteBorrar.id)
    setBorrando(false)
    if (!resultado.ok) {
      setErrorBorrar(resultado.error)
      return
    }
    setSesiones((actual) => actual.filter((sesion) => sesion.id !== pendienteBorrar.id))
    setPendienteBorrar(null)
  }

  const candidatas: Candidata[] = porVer.map((item) => ({
    id: item.id,
    titulo: item.titulo,
    duracion: duraciones.porId[item.tmdb_id]?.minutos ?? null,
  }))
  const clasificacion =
    tiempo !== null && !duraciones.cargando
      ? peliculasQueCaben(tiempo, candidatas, PAUSA_MINUTOS)
      : null

  return (
    <section className="pagina">
      <header className="encabezado">
        <p className="kicker">Sesión</p>
        <h1>Noche de película</h1>
        <p className="programa">Elige un rato y mira qué películas por ver te alcanzan.</p>
      </header>

      {errorLista ? <Aviso>{errorLista}</Aviso> : null}
      {cargandoLista ? <EstadoCarga mensaje="Cargando tu lista…" /> : null}

      {!cargandoLista && porVer.length === 0 ? (
        <div className="vacio">
          <h2>No tienes películas por ver.</h2>
          <p>
            La noche solo usa películas en ese estado. Las series se quedan en tu lista.{" "}
            <Link to="/buscar">Buscar en TMDB</Link>
          </p>
        </div>
      ) : null}

      {!cargandoLista && porVer.length > 0 ? (
        <SelectorTiempo
          valor={tiempoTexto}
          onChange={setTiempoTexto}
          onConfirmar={confirmarTiempo}
        />
      ) : null}
      {errorTiempo ? <Aviso>{errorTiempo}</Aviso> : null}

      {duraciones.todasFallaron ? (
        <div className="noche-grupo">
          <Aviso>No se pudieron consultar las duraciones.</Aviso>
          <button className="boton linea" type="button" onClick={duraciones.reintentar}>
            Reintentar
          </button>
        </div>
      ) : null}

      {tiempo !== null && !duraciones.todasFallaron ? (
        <div className="noche-columnas con-resumen">
          <div>
            {duraciones.cargando ? <EstadoCarga mensaje="Consultando duraciones…" /> : null}
            {clasificacion ? (
              <div className="noche-grupo">
                <h2>Caben</h2>
                {clasificacion.caben.length === 0 ? (
                  <p className="meta">Ninguna película cabe sola en ese tiempo.</p>
                ) : (
                  <div className="boletos">
                    {clasificacion.caben.map((pelicula) => {
                      const yaEsta = elegidas.some((elegida) => elegida.id === pelicula.id)
                      return (
                        <CandidataNoche
                          key={pelicula.id}
                          titulo={pelicula.titulo}
                          posterUrl={porIdLista.get(pelicula.id)?.poster_url ?? null}
                          detalle={`${pelicula.duracion} min`}
                          aviso={avisoId === pelicula.id ? avisoAgregar : null}
                          accion={{
                            etiqueta: yaEsta ? "Quitar" : "Agregar",
                            variante: yaEsta ? "linea" : "primaria",
                            onClick: () => (yaEsta ? quitar(pelicula.id) : agregar(pelicula)),
                          }}
                        />
                      )
                    })}
                  </div>
                )}
              </div>
            ) : null}
            {clasificacion && clasificacion.noDisponibles.length > 0 ? (
              <div className="noche-grupo">
                <h2>No disponibles</h2>
                <div className="boletos">
                  {clasificacion.noDisponibles.map(({ candidata, motivo }) => {
                    const item = porIdLista.get(candidata.id)
                    const error = item ? duraciones.porId[item.tmdb_id]?.error : null
                    return (
                      <CandidataNoche
                        key={candidata.id}
                        titulo={candidata.titulo}
                        posterUrl={item?.poster_url ?? null}
                        detalle="No disponible"
                        aviso={error ?? fraseNoDisponible(motivo, candidata.duracion, tiempo)}
                      />
                    )
                  })}
                </div>
              </div>
            ) : null}
          </div>
          <ResumenSesion
            tiempo={tiempo}
            elegidas={elegidas}
            aviso={avisoAgregar}
            avisoTono={avisoTono}
            nombre={nombre}
            onNombre={setNombre}
            onGuardar={() => void guardar()}
            guardando={guardando}
            onQuitar={quitar}
            onLlenar={llenar}
          />
        </div>
      ) : null}

      <div className="noche-grupo">
        <h2>Guardadas</h2>
        {errorSesiones ? <Aviso>{errorSesiones}</Aviso> : null}
        {cargandoSesiones ? <EstadoCarga mensaje="Cargando tus noches…" /> : null}
        {!cargandoSesiones && !errorSesiones && sesiones.length === 0 ? (
          <div className="vacio">
            <h2>Todavía no guardas una noche.</h2>
            <p>Cuando armes una y le pongas nombre, aparece aquí.</p>
          </div>
        ) : sesiones.length > 0 ? (
          <div className="boletos">
            {sesiones.map((sesion) => (
              <article className="ticket" key={sesion.id}>
                <Link
                  to={`/noche/${sesion.id}`}
                  className="ticket-poster"
                  aria-label={`Abrir ${sesion.nombre}`}
                >
                  <Poster
                    url={sesion.peliculas[0]?.posterUrl ?? null}
                    titulo={sesion.nombre}
                    tamano="boleto"
                    decorativo
                  />
                </Link>
                <div className="ticket-cuerpo">
                  <p className="kicker">{fechaCorta(sesion.creadaEn)}</p>
                  <h2>
                    <Link to={`/noche/${sesion.id}`}>{sesion.nombre}</Link>
                  </h2>
                  <p className="meta">
                    {sesion.tiempoDisponible} min disponibles · {sesion.duracionTotal} min en total
                  </p>
                  <p className="meta">
                    {sesion.peliculas
                      .map((pelicula) =>
                        pelicula.miListaId == null
                          ? `${pelicula.titulo} (ya no está en tu lista)`
                          : pelicula.titulo,
                      )
                      .join(" · ")}
                  </p>
                  <div className="ticket-acciones">
                    <button
                      type="button"
                      className="boton peligro"
                      onClick={() => {
                        setErrorBorrar(null)
                        setPendienteBorrar(sesion)
                      }}
                    >
                      <Trash2 size={16} strokeWidth={1.75} aria-hidden />
                      Borrar
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>
      <Dialogo
        abierto={pendienteBorrar !== null}
        titulo="Borrar sesión"
        texto={pendienteBorrar ? `¿Borrar «${pendienteBorrar.nombre}»?` : ""}
        confirmar={borrando ? "Borrando…" : "Borrar"}
        ocupado={borrando}
        error={errorBorrar}
        onConfirmar={() => void borrarSesion()}
        onCerrar={() => {
          if (!borrando) setPendienteBorrar(null)
        }}
      />
    </section>
  )
}
