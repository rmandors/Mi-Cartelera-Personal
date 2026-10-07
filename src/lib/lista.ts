import type { ItemLista, NuevoTitulo } from "../types/catalogo"
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

export async function agregarTitulo(entrada: NuevoTitulo): Promise<ResultadoMutacion> {
  if (!supabase) return { ok: false, error: SIN_CONFIG }
  const { error } = await supabase.from("mi_lista").insert({
    tmdb_id: entrada.tmdbId,
    titulo: entrada.titulo,
    poster_url: entrada.posterUrl,
    tipo_contenido: entrada.tipo,
    estado: "por_ver",
  })

  if (error) return { ok: false, error: error.message }
  return { ok: true, error: null }
}

