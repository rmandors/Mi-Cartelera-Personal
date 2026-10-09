import type { ItemLista } from "../types/catalogo"

export function textoMeta(metadata: unknown, clave: string): string {
  if (!metadata || typeof metadata !== "object") return ""
  const valor = (metadata as Record<string, unknown>)[clave]
  return typeof valor === "string" ? valor.trim() : ""
}

export function nombreVisible(metadata: unknown): string {
  return [textoMeta(metadata, "nombre"), textoMeta(metadata, "apellido")].filter(Boolean).join(" ")
}

export function metadatosPerfil(nombre: string, apellido: string) {
  return {
    nombre,
    apellido: apellido || null,
    display_name: [nombre, apellido].filter(Boolean).join(" "),
  }
}

export function fechaCorta(iso: string): string {
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return iso
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(fecha)
}

function cifra(n: number, uno: string, muchos: string): string {
  return `${n} ${n === 1 ? uno : muchos}`
}

export function textoResumen(items: ItemLista[]): string {
  const pendientes = items.filter((item) => item.estado === "por_ver").length
  const progreso = items.filter((item) => item.estado === "viendo").length
  const vistas = items.filter((item) => item.estado === "vista").length
  return `Tienes ${cifra(pendientes, "pendiente", "pendientes")}, ${progreso} en progreso, ${cifra(vistas, "vista", "vistas")}`
}
