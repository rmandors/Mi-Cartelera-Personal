import { createClient } from "@supabase/supabase-js"

function crearCliente() {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim()
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()
  if (!url || !anonKey) return null
  return createClient(url, anonKey)
}

export const supabase = crearCliente()
export const supabaseConfigurado = supabase !== null
