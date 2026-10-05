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

