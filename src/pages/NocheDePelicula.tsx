import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Aviso } from "../components/Aviso"
import { CandidataNoche } from "../components/CandidataNoche"
import { EstadoCarga } from "../components/EstadoCarga"
import { SelectorTiempo } from "../components/SelectorTiempo"
import {
  PAUSA_MINUTOS,
  peliculasQueCaben,
  validarTiempo,
  type Candidata,
  type MotivoNoDisponible,
} from "../dominio/noche"
import { useDuraciones } from "../hooks/useDuraciones"
import { useTitulo } from "../hooks/useTitulo"
import { listarColeccion } from "../lib/lista"
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

export function NocheDePelicula() {
  const [items, setItems] = useState<ItemLista[]>([])
  const [cargandoLista, setCargandoLista] = useState(true)
  const [errorLista, setErrorLista] = useState<string | null>(null)
  const [tiempoTexto, setTiempoTexto] = useState("")
  const [tiempo, setTiempo] = useState<number | null>(null)
  const [errorTiempo, setErrorTiempo] = useState<string | null>(null)
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
      setErrorTiempo(FRASE_TIEMPO)
      return
    }
    setErrorTiempo(null)
    setTiempo(resultado.minutos)
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

      {duraciones.cargando ? <EstadoCarga mensaje="Consultando duraciones…" /> : null}
      {duraciones.todasFallaron ? (
        <div className="noche-grupo">
          <Aviso>No se pudieron consultar las duraciones.</Aviso>
          <button className="boton linea" type="button" onClick={duraciones.reintentar}>
            Reintentar
          </button>
        </div>
      ) : null}

      {clasificacion && !duraciones.todasFallaron ? (
        <div className="noche-columnas">
          <div>
            <div className="noche-grupo">
              <h2>Caben</h2>
              {clasificacion.caben.length === 0 ? (
                <p className="meta">Ninguna película cabe sola en ese tiempo.</p>
              ) : (
                <div className="boletos">
                  {clasificacion.caben.map((pelicula) => (
                    <CandidataNoche
                      key={pelicula.id}
                      titulo={pelicula.titulo}
                      posterUrl={porIdLista.get(pelicula.id)?.poster_url ?? null}
                      detalle={`${pelicula.duracion} min`}
                    />
                  ))}
                </div>
              )}
            </div>
            {clasificacion.noDisponibles.length > 0 ? (
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
                        aviso={error ?? fraseNoDisponible(motivo, candidata.duracion, tiempo ?? 0)}
                      />
                    )
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  )
}
