import type { EstadoVisualizacion, ItemLista, NuevoTitulo } from "../types/catalogo"
import { supabase } from "./supabase"

const SIN_CONFIG = "Supabase no está configurado. Revisa .env."

export interface ResultadoMutacion {
  ok: boolean
  duplicado?: boolean
  error: string | null
}

export async function listarColeccion(): Promise<{ datos: ItemLista[]; error: string | null }> {
  if (!supabase) return { datos: [], error: SIN_CONFIG }
  const { data, error } = await supabase
    .from("mi_lista")
    .select("*")
    .order("fecha_agregado", { ascending: false })

  if (error) return { datos: [], error: error.message }
  return { datos: (data ?? []) as ItemLista[], error: null }
}

export async function obtenerTitulo(
  id: number,
): Promise<{ dato: ItemLista | null; error: string | null }> {
  if (!supabase) return { dato: null, error: SIN_CONFIG }
  const { data, error } = await supabase.from("mi_lista").select("*").eq("id", id).maybeSingle()
  if (error) return { dato: null, error: error.message }
  return { dato: (data as ItemLista | null) ?? null, error: null }
}

export async function agregarTitulo(entrada: NuevoTitulo): Promise<ResultadoMutacion> {
  if (!supabase) return { ok: false, error: SIN_CONFIG }
  const { error } = await supabase.from("mi_lista").insert({
    tmdb_id: entrada.tmdbId,
    titulo: entrada.titulo,
    poster_url: entrada.posterUrl,
    tipo_contenido: entrada.tipo,
    estado: "por_ver",
  })

  if (!error) return { ok: true, error: null }
  const duplicado = error.code === "23505"
  return {
    ok: false,
    duplicado,
    error: duplicado ? "Ese título ya está en tu lista." : error.message,
  }
}

export async function actualizarTitulo(
  id: number,
  cambios: {
    estado?: EstadoVisualizacion
    calificacion_personal?: number | null
    comentario?: string | null
  },
): Promise<ResultadoMutacion> {
  if (!supabase) return { ok: false, error: SIN_CONFIG }
  const { error } = await supabase.from("mi_lista").update(cambios).eq("id", id)
  if (error) return { ok: false, error: error.message }
  return { ok: true, error: null }
}

export async function eliminarTitulo(id: number): Promise<ResultadoMutacion> {
  if (!supabase) return { ok: false, error: SIN_CONFIG }
  const { error } = await supabase.from("mi_lista").delete().eq("id", id)
  if (error) return { ok: false, error: error.message }
  return { ok: true, error: null }
}
