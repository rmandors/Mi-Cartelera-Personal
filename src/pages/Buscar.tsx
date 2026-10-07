import { Search } from "lucide-react"
import { useState, type FormEvent } from "react"
import { Aviso } from "../components/Aviso"
import { EstadoCarga } from "../components/EstadoCarga"
import { Poster } from "../components/Poster"
import { useTitulo } from "../hooks/useTitulo"
import { buscarTitulos } from "../lib/tmdb"
import { ETIQUETA_TIPO, claveTitulo, type ResultadoBusqueda } from "../types/catalogo"

export function Buscar() {
  const [consulta, setConsulta] = useState("")
  const [resultados, setResultados] = useState<ResultadoBusqueda[]>([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [buscado, setBuscado] = useState("")
  useTitulo("Buscar")

  async function buscar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const texto = consulta.trim()
    if (texto.length < 2) {
      setError("Escribe al menos 2 letras.")
      return
    }
    setError(null)
    setCargando(true)
    setBuscado(texto)
    try {
      setResultados(await buscarTitulos(texto))
    } catch (fallo) {
      setResultados([])
      setError(fallo instanceof Error ? fallo.message : "No se pudo buscar en TMDB.")
    } finally {
      setCargando(false)
    }
  }

  return (
    <section className="pagina">
      <header className="encabezado">
        <p className="kicker">Taquilla</p>
        <h1>Buscar</h1>
        <p className="programa">Películas y series reales, directo de TMDB.</p>
      </header>

      <form className="buscador" role="search" onSubmit={(evento) => void buscar(evento)}>
        <label className="campo crecer" htmlFor="consulta">
          <span>Título</span>
          <input
            id="consulta"
            value={consulta}
            placeholder="Ej. Parasite, The Bear"
            onChange={(evento) => setConsulta(evento.target.value)}
          />
        </label>
        <button className="boton" type="submit" disabled={cargando}>
          <Search size={16} strokeWidth={1.75} aria-hidden />
          {cargando ? "Buscando…" : "Buscar"}
        </button>
      </form>

      {error ? <Aviso>{error}</Aviso> : null}
      {cargando ? <EstadoCarga mensaje="Buscando en TMDB…" /> : null}

      {!cargando && buscado && resultados.length === 0 && !error ? (
        <div className="vacio">
          <h2>Sin coincidencias.</h2>
          <p>No hay películas ni series para «{buscado}».</p>
        </div>
      ) : null}

      <div className="reja">
        {resultados.map((item, indice) => {
          const clave = claveTitulo(item.tipo, item.tmdbId)
          return (
            <article
              key={clave}
              className="cartel"
              style={{ animationDelay: `${Math.min(indice, 8) * 40}ms` }}
            >
              <Poster url={item.posterUrl} titulo={item.titulo} tamano="cartel" decorativo />
              <p className="kicker">
                {ETIQUETA_TIPO[item.tipo]} · {item.anio ?? "Sin año"}
              </p>
              <h2>{item.titulo}</h2>
              {item.sinopsis ? <p className="recorte">{item.sinopsis}</p> : null}
            </article>
          )
        })}
      </div>
    </section>
  )
}
