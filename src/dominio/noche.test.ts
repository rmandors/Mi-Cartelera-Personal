import { describe, expect, it } from "vitest"
import {
  PAUSA_MINUTOS,
  cabe,
  duracionTotal,
  evaluarAgregado,
  peliculasQueCaben,
  validarNombre,
  validarTiempo,
} from "./noche"

describe("validarTiempo", () => {
  it("acepta 30 y 600", () => {
    expect(validarTiempo(30)).toEqual({ ok: true, minutos: 30 })
    expect(validarTiempo(600)).toEqual({ ok: true, minutos: 600 })
    expect(validarTiempo("120")).toEqual({ ok: true, minutos: 120 })
    expect(validarTiempo("  45 ")).toEqual({ ok: true, minutos: 45 })
  })

  it("rechaza el vacío, el texto y el decimal", () => {
    expect(validarTiempo("")).toEqual({ ok: false, motivo: "vacio" })
    expect(validarTiempo("   ")).toEqual({ ok: false, motivo: "vacio" })
    expect(validarTiempo(null)).toEqual({ ok: false, motivo: "vacio" })
    expect(validarTiempo("abc")).toEqual({ ok: false, motivo: "no_entero" })
    expect(validarTiempo("90.5")).toEqual({ ok: false, motivo: "no_entero" })
    expect(validarTiempo(90.5)).toEqual({ ok: false, motivo: "no_entero" })
  })

  it("rechaza 29 y 601", () => {
    expect(validarTiempo(29)).toEqual({ ok: false, motivo: "fuera_de_rango" })
    expect(validarTiempo(601)).toEqual({ ok: false, motivo: "fuera_de_rango" })
    expect(validarTiempo(0)).toEqual({ ok: false, motivo: "fuera_de_rango" })
    expect(cabe(29, [20], PAUSA_MINUTOS)).toBe(false)
  })
})

describe("duracion y cabe", () => {
  it("una sola película no suma pausa", () => {
    expect(duracionTotal([95], PAUSA_MINUTOS)).toBe(95)
    expect(cabe(95, [95], PAUSA_MINUTOS)).toBe(true)
    expect(cabe(94, [95], PAUSA_MINUTOS)).toBe(false)
  })

  it("tres películas suman dos pausas", () => {
    expect(duracionTotal([40, 50, 30], PAUSA_MINUTOS)).toBe(140)
    expect(duracionTotal([], PAUSA_MINUTOS)).toBe(0)
  })

  it("el tiempo exacto sí cabe", () => {
    expect(cabe(120, [120], PAUSA_MINUTOS)).toBe(true)
    expect(cabe(120, [50, 60], PAUSA_MINUTOS)).toBe(true)
    expect(cabe(119, [50, 60], PAUSA_MINUTOS)).toBe(false)
  })
})

describe("evaluarAgregado", () => {
  it("no agrega una duración nula o cero", () => {
    const vacia: { id: number; duracion: number }[] = []
    expect(evaluarAgregado(120, vacia, { id: 1, duracion: null }, PAUSA_MINUTOS)).toMatchObject({
      ok: false,
      motivo: "sin_duracion",
      total: 0,
      restante: 120,
    })
    expect(evaluarAgregado(120, vacia, { id: 1, duracion: 0 }, PAUSA_MINUTOS).motivo).toBe(
      "sin_duracion",
    )
  })

  it("rechaza la que no cabe en lo que queda y no cambia el total", () => {
    const actuales = [{ id: 1, duracion: 80 }]
    const resultado = evaluarAgregado(100, actuales, { id: 2, duracion: 30 }, PAUSA_MINUTOS)
    expect(resultado).toEqual({ ok: false, motivo: "no_cabe", total: 80, restante: 20 })
  })

  it("no duplica una película en la misma sesión", () => {
    const resultado = evaluarAgregado(
      120,
      [{ id: 4, duracion: 40 }],
      { id: 4, duracion: 40 },
      PAUSA_MINUTOS,
    )
    expect(resultado).toEqual({ ok: false, motivo: "duplicada", total: 40, restante: 80 })
  })

  it("agrega cuando la suma con pausa ocupa exactamente el tiempo", () => {
    const resultado = evaluarAgregado(
      100,
      [{ id: 1, duracion: 40 }],
      { id: 2, duracion: 50 },
      PAUSA_MINUTOS,
    )
    expect(resultado).toEqual({ ok: true, motivo: null, total: 100, restante: 0 })
  })

  it("rechaza un tiempo inválido sin tocar el total", () => {
    const resultado = evaluarAgregado(10, [], { id: 1, duracion: 40 }, PAUSA_MINUTOS)
    expect(resultado.motivo).toBe("tiempo_invalido")
    expect(resultado.ok).toBe(false)
  })
})

describe("peliculasQueCaben", () => {
  it("ordena de la más corta a la más larga y por título", () => {
    const clasificacion = peliculasQueCaben(
      120,
      [
        { id: 1, titulo: "Zona", duracion: 100 },
        { id: 2, titulo: "Beta", duracion: 40 },
        { id: 3, titulo: "Alfa", duracion: 40 },
      ],
      PAUSA_MINUTOS,
    )
    expect(clasificacion.caben.map((pelicula) => pelicula.titulo)).toEqual(["Alfa", "Beta", "Zona"])
  })

  it("aparta la que no cabe ni sola", () => {
    const clasificacion = peliculasQueCaben(
      90,
      [
        { id: 1, titulo: "Corta", duracion: 80 },
        { id: 2, titulo: "Larga", duracion: 91 },
        { id: 3, titulo: "Sin dato", duracion: null },
        { id: 4, titulo: "Cero", duracion: 0 },
      ],
      PAUSA_MINUTOS,
    )
    expect(clasificacion.caben.map((pelicula) => pelicula.id)).toEqual([1])
    expect(clasificacion.noDisponibles.map((item) => item.motivo)).toEqual([
      "no_cabe_sola",
      "sin_duracion",
      "sin_duracion",
    ])
  })
})

describe("validarNombre", () => {
  it("recorta y exige entre 1 y 60 caracteres", () => {
    expect(validarNombre("  Sábado  ")).toEqual({ ok: true, nombre: "Sábado" })
    expect(validarNombre("   ")).toEqual({ ok: false, motivo: "vacio" })
    expect(validarNombre(12)).toEqual({ ok: false, motivo: "vacio" })
    expect(validarNombre("a".repeat(60)).ok).toBe(true)
    expect(validarNombre("a".repeat(61))).toEqual({ ok: false, motivo: "largo" })
  })
})
