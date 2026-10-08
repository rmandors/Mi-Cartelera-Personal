import type { ResultadoBusqueda } from "../types/catalogo"

const BASE = "https://api.themoviedb.org/3"

interface CrudoBusqueda {
  id: number
  media_type?: string
  title?: string
  name?: string
  poster_path?: string | null
  release_date?: string
  first_air_date?: string
  overview?: string
}

interface RespuestaBusqueda {
  results?: CrudoBusqueda[]
}

function claveTmdb(): string {
  const clave = import.meta.env.VITE_TMDB_API_KEY?.trim()
  if (!clave) {
    throw new Error("Falta la clave de TMDB. Agrégala en .env como VITE_TMDB_API_KEY.")
  }
  return clave
}

export function urlImagen(ruta: string | null | undefined): string | null {
  if (!ruta) return null
  return `https://image.tmdb.org/t/p/w500${ruta}`
}

async function pedir<T>(ruta: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE}${ruta}`)
  url.searchParams.set("api_key", claveTmdb())
  url.searchParams.set("language", "es-ES")
  for (const [nombre, valor] of Object.entries(params)) {
    url.searchParams.set(nombre, valor)
  }

  let respuesta: Response
  try {
    respuesta = await fetch(url)
  } catch {
    throw new Error("No se pudo contactar TMDB. Revisa tu conexión.")
  }

  if (respuesta.status === 401) throw new Error("La clave de TMDB fue rechazada.")
  if (respuesta.status === 404) throw new Error("TMDB ya no muestra este título.")
  if (!respuesta.ok) throw new Error("TMDB no respondió. Intenta de nuevo.")
  return (await respuesta.json()) as T
}

function anioDe(fecha?: string): string | null {
  if (!fecha || fecha.length < 4) return null
  return fecha.slice(0, 4)
}

export async function buscarTitulos(consulta: string): Promise<ResultadoBusqueda[]> {
  const datos = await pedir<RespuestaBusqueda>("/search/multi", {
    query: consulta,
    include_adult: "false",
  })

  return (datos.results ?? [])
    .filter((item) => item.media_type === "movie" || item.media_type === "tv")
    .map((item) => {
      const serie = item.media_type === "tv"
      const fecha = serie ? item.first_air_date : item.release_date
      const titulo = (serie ? item.name : item.title)?.trim() || "Sin título"
      return {
        tmdbId: item.id,
        titulo,
        posterUrl: urlImagen(item.poster_path),
        anio: anioDe(fecha),
        tipo: serie ? "serie" : "pelicula",
        sinopsis: item.overview?.trim() ?? "",
      }
    })
}
