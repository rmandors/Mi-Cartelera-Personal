import { validarNombre } from "../dominio/noche"
import { actualizarTitulo } from "./lista"
import { supabase } from "./supabase"

const SIN_CONFIG = "Supabase no está configurado. Revisa .env."
const SIN_PELICULAS = "La noche necesita al menos una película."
const SIN_DURACION = "No se puede agregar: TMDB no tiene una duración para esta película."
const REPETIDA = "Esa película ya está en esta sesión."

export interface PeliculaGuardada {
  id: number
  miListaId: number | null
  tmdbId: number
  titulo: string
  posterUrl: string | null
  duracion: number
  posicion: number
}

export interface SesionGuardada {
  id: number
  nombre: string
  tiempoDisponible: number
  duracionTotal: number
  creadaEn: string
  realizada: boolean
  peliculas: PeliculaGuardada[]
}

export interface NuevaPeliculaSesion {
  miListaId: number
  tmdbId: number
  titulo: string
  posterUrl: string | null
  duracion: number
  posicion: number
}

export interface NuevaSesion {
  nombre: string
  tiempoDisponible: number
  duracionTotal: number
  peliculas: NuevaPeliculaSesion[]
}

export interface ResultadoGuardado {
  ok: boolean
  error: string | null
  sesion: SesionGuardada | null
}

interface FilaPelicula {
  id: number
  mi_lista_id: number | null
  tmdb_id: number
  titulo: string
  poster_url: string | null
  duracion: number
  posicion: number
}

interface FilaSesion {
  id: number
  nombre: string
  tiempo_disponible: number
  duracion_total: number
  creada_en: string
  realizada?: boolean | null
  sesion_peliculas?: FilaPelicula[] | null
}

const SELECCION =
  "id, nombre, tiempo_disponible, duracion_total, creada_en, realizada, sesion_peliculas(id, mi_lista_id, tmdb_id, titulo, poster_url, duracion, posicion)"

export async function listarSesiones(): Promise<{ datos: SesionGuardada[]; error: string | null }> {
  if (!supabase) return { datos: [], error: SIN_CONFIG }
  const { data, error } = await supabase
    .from("sesiones")
    .select(SELECCION)
    .order("creada_en", { ascending: false })

  if (error) return { datos: [], error: error.message }
  return { datos: ((data ?? []) as FilaSesion[]).map(aSesion), error: null }
}

export async function obtenerSesion(
  id: number,
): Promise<{ dato: SesionGuardada | null; error: string | null }> {
  if (!supabase) return { dato: null, error: SIN_CONFIG }
  const { data, error } = await supabase
    .from("sesiones")
    .select(SELECCION)
    .eq("id", id)
    .maybeSingle()

  if (error) return { dato: null, error: error.message }
  return { dato: data ? aSesion(data as FilaSesion) : null, error: null }
}

export async function guardarSesion(entrada: NuevaSesion): Promise<ResultadoGuardado> {
  if (!supabase) return { ok: false, error: SIN_CONFIG, sesion: null }

  const nombre = validarNombre(entrada.nombre)
  if (!nombre.ok) {
    const error =
      nombre.motivo === "largo"
        ? "El nombre puede tener hasta 60 caracteres."
        : "Ponle un nombre a la noche."
    return { ok: false, error, sesion: null }
  }

  if (entrada.peliculas.length === 0) return { ok: false, error: SIN_PELICULAS, sesion: null }

  const posiciones = new Set<number>()
  const titulos = new Set<number>()
  for (const pelicula of entrada.peliculas) {
    if (pelicula.duracion <= 0) return { ok: false, error: SIN_DURACION, sesion: null }
    if (posiciones.has(pelicula.posicion) || titulos.has(pelicula.tmdbId)) {
      return { ok: false, error: REPETIDA, sesion: null }
    }
    posiciones.add(pelicula.posicion)
    titulos.add(pelicula.tmdbId)
  }

  const { data, error } = await supabase
    .from("sesiones")
    .insert({
      nombre: nombre.nombre,
      tiempo_disponible: entrada.tiempoDisponible,
      duracion_total: entrada.duracionTotal,
    })
    .select("id, nombre, tiempo_disponible, duracion_total, creada_en, realizada")
    .single()

  if (error || !data) {
    return { ok: false, error: error?.message ?? "No se pudo guardar la sesión.", sesion: null }
  }

  const fila = data as FilaSesion
  const { error: errorPeliculas } = await supabase.from("sesion_peliculas").insert(
    entrada.peliculas.map((pelicula) => ({
      sesion_id: fila.id,
      mi_lista_id: pelicula.miListaId,
      tmdb_id: pelicula.tmdbId,
      titulo: pelicula.titulo,
      poster_url: pelicula.posterUrl,
      duracion: pelicula.duracion,
      posicion: pelicula.posicion,
    })),
  )

  if (errorPeliculas) {
    await supabase.from("sesiones").delete().eq("id", fila.id)
    return { ok: false, error: errorPeliculas.message, sesion: null }
  }

  return {
    ok: true,
    error: null,
    sesion: aSesion({
      ...fila,
      sesion_peliculas: entrada.peliculas.map((pelicula, indice) => ({
        id: indice,
        mi_lista_id: pelicula.miListaId,
        tmdb_id: pelicula.tmdbId,
        titulo: pelicula.titulo,
        poster_url: pelicula.posterUrl,
        duracion: pelicula.duracion,
        posicion: pelicula.posicion,
      })),
    }),
  }
}

export async function marcarRealizada(
  sesion: SesionGuardada,
): Promise<{ ok: boolean; error: string | null; omitidas: string[] }> {
  if (!supabase) return { ok: false, error: SIN_CONFIG, omitidas: [] }
  if (sesion.realizada) {
    return { ok: false, error: "Esta noche ya está realizada.", omitidas: [] }
  }

  const omitidas: string[] = []
  for (const pelicula of sesion.peliculas) {
    if (pelicula.miListaId == null) {
      omitidas.push(pelicula.titulo)
      continue
    }
    const resultado = await actualizarTitulo(pelicula.miListaId, { estado: "vista" })
    if (!resultado.ok) {
      return { ok: false, error: resultado.error, omitidas }
    }
  }

  const { error } = await supabase.from("sesiones").update({ realizada: true }).eq("id", sesion.id)
  if (error) return { ok: false, error: error.message, omitidas }
  return { ok: true, error: null, omitidas }
}

export async function eliminarSesion(id: number): Promise<{ ok: boolean; error: string | null }> {
  if (!supabase) return { ok: false, error: SIN_CONFIG }
  const { error } = await supabase.from("sesiones").delete().eq("id", id)
  if (error) return { ok: false, error: error.message }
  return { ok: true, error: null }
}

function aSesion(fila: FilaSesion): SesionGuardada {
  const peliculas = [...(fila.sesion_peliculas ?? [])]
    .sort((a, b) => a.posicion - b.posicion)
    .map((pelicula) => ({
      id: pelicula.id,
      miListaId: pelicula.mi_lista_id,
      tmdbId: pelicula.tmdb_id,
      titulo: pelicula.titulo,
      posterUrl: pelicula.poster_url,
      duracion: pelicula.duracion,
      posicion: pelicula.posicion,
    }))

  return {
    id: fila.id,
    nombre: fila.nombre,
    tiempoDisponible: fila.tiempo_disponible,
    duracionTotal: fila.duracion_total,
    creadaEn: fila.creada_en,
    realizada: fila.realizada === true,
    peliculas,
  }
}
