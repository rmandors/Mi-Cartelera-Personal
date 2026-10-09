import { Bookmark, Check, LayoutGrid, Play } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Aviso } from "../components/Aviso"
import { Dialogo } from "../components/Dialogo"
import { EstadoCarga } from "../components/EstadoCarga"
import { FilaTitulo } from "../components/FilaTitulo"
import { useTitulo } from "../hooks/useTitulo"
import { actualizarTitulo, eliminarTitulo, listarColeccion } from "../lib/lista"
import { textoResumen } from "../lib/texto"
import {
  ESTADOS,
  ETIQUETA_ESTADO,
  type EstadoVisualizacion,
  type ItemLista,
} from "../types/catalogo"

type Filtro = "todos" | EstadoVisualizacion
type Orden = "fecha" | "nota"

const ICONO_ESTADO = {
  por_ver: Bookmark,
  viendo: Play,
  vista: Check,
} as const

export function MiLista() {
  const [items, setItems] = useState<ItemLista[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtro, setFiltro] = useState<Filtro>("todos")
  const [orden, setOrden] = useState<Orden>("fecha")
  const [actualizando, setActualizando] = useState<number | null>(null)
  const [pendiente, setPendiente] = useState<ItemLista | null>(null)
  const [quitando, setQuitando] = useState(false)
  const [errorQuitar, setErrorQuitar] = useState<string | null>(null)
  useTitulo("Lista")

  useEffect(() => {
    let activo = true
    listarColeccion().then(({ datos, error: fallo }) => {
      if (!activo) return
      setItems(datos)
      setError(fallo)
      setCargando(false)
    })
    return () => {
      activo = false
    }
  }, [])

  const visibles = useMemo(() => {
    const filtrados = filtro === "todos" ? items : items.filter((item) => item.estado === filtro)
    return [...filtrados].sort((a, b) => comparar(a, b, orden))
  }, [items, filtro, orden])

  async function cambiarEstado(item: ItemLista, estado: EstadoVisualizacion) {
    if (item.estado === estado) return
    setActualizando(item.id)
    setItems((prev) => prev.map((fila) => (fila.id === item.id ? { ...fila, estado } : fila)))
    const resultado = await actualizarTitulo(item.id, { estado })
    setActualizando(null)
    if (!resultado.ok) {
      setError(resultado.error)
      const recarga = await listarColeccion()
      setItems(recarga.datos)
    }
  }

  async function quitar() {
    if (!pendiente) return
    setErrorQuitar(null)
    setQuitando(true)
    const resultado = await eliminarTitulo(pendiente.id)
    setQuitando(false)
    if (!resultado.ok) {
      setErrorQuitar(resultado.error)
      return
    }
    setItems((prev) => prev.filter((fila) => fila.id !== pendiente.id))
    setPendiente(null)
  }

  return (
    <section className="pagina">
      <header className="encabezado">
        <p className="kicker">Sala</p>
        <h1>Mi lista</h1>
        {!cargando && items.length > 0 ? <p className="programa">{textoResumen(items)}</p> : null}
      </header>

      {error ? <Aviso>{error}</Aviso> : null}

      <div className="herramientas">
        <div className="filtros" role="group" aria-label="Filtrar por estado">
          <button
            type="button"
            className={filtro === "todos" ? "activo" : undefined}
            onClick={() => setFiltro("todos")}
          >
            <LayoutGrid size={15} strokeWidth={1.75} aria-hidden />
            Todos
          </button>
          {ESTADOS.map((estado) => {
            const Icono = ICONO_ESTADO[estado]
            return (
              <button
                key={estado}
                type="button"
                className={filtro === estado ? "activo" : undefined}
                onClick={() => setFiltro(estado)}
              >
                <Icono size={15} strokeWidth={1.75} aria-hidden />
                {ETIQUETA_ESTADO[estado]}
              </button>
            )
          })}
        </div>
        <label className="orden">
          <span>Orden</span>
          <select value={orden} onChange={(evento) => setOrden(evento.target.value as Orden)}>
            <option value="fecha">Fecha agregada</option>
            <option value="nota">Calificación personal</option>
          </select>
        </label>
      </div>

      {cargando ? <EstadoCarga mensaje="Cargando tu lista…" /> : null}

      {!cargando && items.length === 0 ? (
        <div className="vacio">
          <h2>La sala está vacía.</h2>
          <p>
            Cuando agregues un título, aparece aquí como un boleto.{" "}
            <Link to="/buscar">Buscar en TMDB</Link>
          </p>
        </div>
      ) : null}

      {!cargando && items.length > 0 && visibles.length === 0 ? (
        <div className="vacio">
          <h2>Nada en este estado.</h2>
          <p>Prueba otro filtro. El contador de arriba sigue contando toda tu lista.</p>
        </div>
      ) : null}

      <div className="boletos">
        {visibles.map((item) => (
          <FilaTitulo
            key={item.id}
            item={item}
            deshabilitado={actualizando === item.id}
            onEstado={(estado) => void cambiarEstado(item, estado)}
            onEliminar={() => {
              setErrorQuitar(null)
              setPendiente(item)
            }}
          />
        ))}
      </div>
      <Dialogo
        abierto={pendiente !== null}
        titulo="Quitar de la lista"
        texto={pendiente ? `¿Quitar «${pendiente.titulo}» de tu lista?` : ""}
        confirmar={quitando ? "Quitando…" : "Quitar"}
        ocupado={quitando}
        error={errorQuitar}
        onConfirmar={() => void quitar()}
        onCerrar={() => {
          if (!quitando) setPendiente(null)
        }}
      />
    </section>
  )
}

function comparar(a: ItemLista, b: ItemLista, orden: Orden): number {
  if (orden === "nota") {
    const notaA = a.calificacion_personal
    const notaB = b.calificacion_personal
    if (notaA == null && notaB == null) return fechaDe(b) - fechaDe(a)
    if (notaA == null) return 1
    if (notaB == null) return -1
    if (notaB !== notaA) return notaB - notaA
  }
  return fechaDe(b) - fechaDe(a)
}

function fechaDe(item: ItemLista): number {
  return new Date(item.fecha_agregado).getTime()
}
