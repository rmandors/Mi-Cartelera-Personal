import { useEffect } from "react"

export function useTitulo(titulo: string) {
  const completo = `Mi Cartelera · ${titulo}`

  useEffect(() => {
    document.title = completo
  }, [completo])
}
