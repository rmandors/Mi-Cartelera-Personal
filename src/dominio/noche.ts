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
  generos?: readonly string[]
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

export function filtrarPorGenero(
  candidatas: readonly Candidata[],
  genero: string | null,
): Candidata[] {
  const elegido = genero?.trim() ?? ""
  if (elegido === "") return [...candidatas]
  return candidatas.filter((candidata) => (candidata.generos ?? []).includes(elegido))
}

const TOPE_BUSQUEDA = 18

export function llenarNoche(
  tiempo: number,
  candidatas: readonly Candidata[],
  pausa: number,
): Candidata[] {
  const tiempoValido = validarTiempo(tiempo)
  if (!tiempoValido.ok || pausa < 0) return []

  const vistas = new Set<number>()
  const utiles: Candidata[] = []
  for (const candidata of candidatas) {
    if (vistas.has(candidata.id)) continue
    vistas.add(candidata.id)
    if (candidata.duracion == null || candidata.duracion <= 0) continue
    if (!cabe(tiempoValido.minutos, [candidata.duracion], pausa)) continue
    utiles.push(candidata)
  }
  if (utiles.length === 0) return []

  const limite = tiempoValido.minutos
  const elegidas =
    utiles.length <= TOPE_BUSQUEDA
      ? buscarExhaustiva(utiles, limite, pausa)
      : buscarPorProgramacion(utiles, limite, pausa)

  return ordenarCandidatas(elegidas)
}

function ordenarCandidatas(lista: readonly Candidata[]): Candidata[] {
  return [...lista].sort((a, b) => {
    const porDuracion = (a.duracion ?? 0) - (b.duracion ?? 0)
    if (porDuracion !== 0) return porDuracion
    const porTitulo = a.titulo.localeCompare(b.titulo, "es")
    if (porTitulo !== 0) return porTitulo
    return a.id - b.id
  })
}

function firma(lista: readonly Candidata[]): string {
  return ordenarCandidatas(lista)
    .map((pelicula) => `${pelicula.titulo}\u0000${pelicula.id}`)
    .join("\u0001")
}

function totalDe(suma: number, cantidad: number, pausa: number): number {
  if (cantidad === 0) return 0
  return suma + pausa * (cantidad - 1)
}

function buscarExhaustiva(
  utiles: readonly Candidata[],
  limite: number,
  pausa: number,
): Candidata[] {
  let mejor: Candidata[] = []
  let mejorTotal = -1
  const actual: Candidata[] = []

  function visitar(indice: number, suma: number) {
    const total = totalDe(suma, actual.length, pausa)
    if (actual.length > 0 && total <= limite) {
      const gana =
        total > mejorTotal ||
        (total === mejorTotal && actual.length > mejor.length) ||
        (total === mejorTotal && actual.length === mejor.length && firma(actual) < firma(mejor))
      if (gana) {
        mejor = [...actual]
        mejorTotal = total
      }
    }

    for (let i = indice; i < utiles.length; i += 1) {
      const duracion = utiles[i].duracion ?? 0
      const siguiente = totalDe(suma + duracion, actual.length + 1, pausa)
      if (siguiente > limite) continue
      actual.push(utiles[i])
      visitar(i + 1, suma + duracion)
      actual.pop()
    }
  }

  visitar(0, 0)
  return mejor
}

function buscarPorProgramacion(
  utiles: readonly Candidata[],
  limite: number,
  pausa: number,
): Candidata[] {
  const ordenadas = ordenarCandidatas(utiles)
  const n = ordenadas.length
  const camino: number[][][] = Array.from({ length: n + 1 }, () =>
    Array.from({ length: limite + 1 }, () => [] as number[]),
  )
  const llega: boolean[][] = Array.from({ length: n + 1 }, () => Array(limite + 1).fill(false))
  llega[0][0] = true

  for (let i = 0; i < n; i += 1) {
    const duracion = ordenadas[i].duracion ?? 0
    for (let k = i; k >= 0; k -= 1) {
      for (let d = limite - duracion; d >= 0; d -= 1) {
        if (!llega[k][d]) continue
        const nk = k + 1
        const nd = d + duracion
        if (totalDe(nd, nk, pausa) > limite) continue
        const propuesta = [...camino[k][d], i]
        if (
          !llega[nk][nd] ||
          firma(propuesta.map((indice) => ordenadas[indice])) <
            firma(camino[nk][nd].map((indice) => ordenadas[indice]))
        ) {
          llega[nk][nd] = true
          camino[nk][nd] = propuesta
        }
      }
    }
  }

  let mejorTotal = -1
  let mejorK = 0
  let mejorD = 0
  for (let k = 1; k <= n; k += 1) {
    for (let d = 0; d <= limite; d += 1) {
      if (!llega[k][d]) continue
      const total = totalDe(d, k, pausa)
      if (total > mejorTotal || (total === mejorTotal && k > mejorK)) {
        mejorTotal = total
        mejorK = k
        mejorD = d
      }
    }
  }

  if (mejorTotal < 0) return []
  return camino[mejorK][mejorD].map((indice) => ordenadas[indice])
}

function clasificarEntero(minutos: number): ResultadoTiempo {
  if (minutos < TIEMPO_MIN || minutos > TIEMPO_MAX) {
    return { ok: false, motivo: "fuera_de_rango" }
  }
  return { ok: true, minutos }
}
