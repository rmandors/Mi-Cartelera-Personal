export type TipoContenido = "pelicula" | "serie"

export const ESTADOS = ["por_ver", "viendo", "vista"] as const
export type EstadoVisualizacion = (typeof ESTADOS)[number]

export const ETIQUETA_TIPO: Record<TipoContenido, string> = {
  pelicula: "Película",
  serie: "Serie",
}

export const ETIQUETA_ESTADO: Record<EstadoVisualizacion, string> = {
  por_ver: "Por ver",
  viendo: "Viendo",
  vista: "Vista",
}

export interface ItemLista {
  id: number
  user_id: string
  tmdb_id: number
  titulo: string
  poster_url: string | null
  tipo_contenido: TipoContenido
  estado: EstadoVisualizacion
  calificacion_personal: number | null
  comentario: string | null
  fecha_agregado: string
}

export interface NuevoTitulo {
  tmdbId: number
  titulo: string
  posterUrl: string | null
  tipo: TipoContenido
}

