export const PAUSA_MINUTOS = 10
export const TIEMPO_MIN = 30
export const TIEMPO_MAX = 600

export type MotivoTiempo = "vacio" | "no_entero" | "fuera_de_rango"

export type ResultadoTiempo = { ok: true; minutos: number } | { ok: false; motivo: MotivoTiempo }

export type MotivoNombre = "vacio" | "largo"

export type ResultadoNombre = { ok: true; nombre: string } | { ok: false; motivo: MotivoNombre }

export type MotivoAgregado = "sin_duracion" | "no_cabe" | "tiempo_invalido" | "duplicada"

export interface PeliculaEnSesion {
  id: number
  duracion: number
}

export interface CandidataAgregar {
  id: number
  duracion: number | null
}

export interface ResultadoAgregado {
  ok: boolean
  motivo: MotivoAgregado | null
  total: number
  restante: number
}

export interface Candidata {
  id: number
  titulo: string
  duracion: number | null
}

export type MotivoNoDisponible = "sin_duracion" | "no_cabe_sola"

export interface NoDisponible {
  candidata: Candidata
  motivo: MotivoNoDisponible
}

export interface Clasificacion {
  caben: Candidata[]
  noDisponibles: NoDisponible[]
}

export function validarTiempo(valor: unknown): ResultadoTiempo {
  if (valor == null) return { ok: false, motivo: "vacio" }

  if (typeof valor === "string") {
    const texto = valor.trim()
    if (texto === "") return { ok: false, motivo: "vacio" }
    if (!/^[+-]?\d+$/.test(texto)) return { ok: false, motivo: "no_entero" }
    return clasificarEntero(Number(texto))
  }

  if (typeof valor === "number") {
    if (!Number.isInteger(valor)) return { ok: false, motivo: "no_entero" }
    return clasificarEntero(valor)
  }

  return { ok: false, motivo: "no_entero" }
}

export function validarNombre(valor: unknown): ResultadoNombre {
  if (typeof valor !== "string") return { ok: false, motivo: "vacio" }
  const nombre = valor.trim()
  if (nombre.length === 0) return { ok: false, motivo: "vacio" }
  if (nombre.length > 60) return { ok: false, motivo: "largo" }
  return { ok: true, nombre }
}

export function duracionTotal(duraciones: readonly number[], pausa: number): number {
  if (duraciones.length === 0) return 0
  const suma = duraciones.reduce((total, minutos) => total + minutos, 0)
  return suma + pausa * (duraciones.length - 1)
}

export function cabe(tiempo: number, duraciones: readonly number[], pausa: number): boolean {
  const tiempoValido = validarTiempo(tiempo)
  if (!tiempoValido.ok) return false
  return duracionTotal(duraciones, pausa) <= tiempoValido.minutos
}

export function evaluarAgregado(
  tiempo: number,
  actuales: readonly PeliculaEnSesion[],
  candidata: CandidataAgregar,
  pausa: number,
): ResultadoAgregado {
  const totalActual = duracionTotal(
    actuales.map((pelicula) => pelicula.duracion),
    pausa,
  )
  const tiempoValido = validarTiempo(tiempo)
  const restanteDe = (total: number) => (tiempoValido.ok ? tiempoValido.minutos - total : 0)

  if (!tiempoValido.ok) {
    return { ok: false, motivo: "tiempo_invalido", total: totalActual, restante: 0 }
  }

  if (candidata.duracion == null || candidata.duracion <= 0) {
    return {
      ok: false,
      motivo: "sin_duracion",
      total: totalActual,
      restante: restanteDe(totalActual),
    }
  }

  if (actuales.some((pelicula) => pelicula.id === candidata.id)) {
    return {
      ok: false,
      motivo: "duplicada",
      total: totalActual,
      restante: restanteDe(totalActual),
    }
  }

  const duraciones = [...actuales.map((pelicula) => pelicula.duracion), candidata.duracion]
  if (!cabe(tiempoValido.minutos, duraciones, pausa)) {
    return { ok: false, motivo: "no_cabe", total: totalActual, restante: restanteDe(totalActual) }
  }

  const total = duracionTotal(duraciones, pausa)
  return { ok: true, motivo: null, total, restante: restanteDe(total) }
}

export function peliculasQueCaben(
  tiempo: number,
  candidatas: readonly Candidata[],
  pausa: number,
): Clasificacion {
  const tiempoValido = validarTiempo(tiempo)
  const caben: Candidata[] = []
  const noDisponibles: NoDisponible[] = []

  for (const candidata of candidatas) {
    if (candidata.duracion == null || candidata.duracion <= 0) {
      noDisponibles.push({ candidata, motivo: "sin_duracion" })
      continue
    }

    const sola = tiempoValido.ok && cabe(tiempoValido.minutos, [candidata.duracion], pausa)
    if (!sola) {
      noDisponibles.push({ candidata, motivo: "no_cabe_sola" })
      continue
    }

    caben.push(candidata)
  }

  caben.sort((a, b) => {
    const porDuracion = (a.duracion ?? 0) - (b.duracion ?? 0)
    if (porDuracion !== 0) return porDuracion
    return a.titulo.localeCompare(b.titulo, "es")
  })

  return { caben, noDisponibles }
}

function clasificarEntero(minutos: number): ResultadoTiempo {
  if (minutos < TIEMPO_MIN || minutos > TIEMPO_MAX) {
    return { ok: false, motivo: "fuera_de_rango" }
  }
  return { ok: true, minutos }
}
