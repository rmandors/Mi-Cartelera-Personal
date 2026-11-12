import { useEffect, useState } from "react"
import { obtenerFichaNoche } from "../lib/tmdb"

export interface DuracionConsultada {
  minutos: number | null
  generos: string[]
  error: string | null
}

interface RespuestaDuraciones {
  clave: string
  intento: number
  porId: Record<number, DuracionConsultada>
}

export function useDuraciones(ids: readonly number[], activo: boolean) {
  const clave = ids.join(",")
  const [intento, setIntento] = useState(0)
  const [respuesta, setRespuesta] = useState<RespuestaDuraciones | null>(null)

  useEffect(() => {
    if (!activo || clave === "") return

    let vivo = true
    const lista = clave.split(",").map(Number)
    void Promise.all(
      lista.map(async (id) => {
        try {
          const ficha = await obtenerFichaNoche(id)
          return [id, { minutos: ficha.minutos, generos: ficha.generos, error: null }] as const
        } catch (fallo) {
          const error =
            fallo instanceof Error ? fallo.message : "TMDB no respondió. Intenta de nuevo."
          return [id, { minutos: null, generos: [], error }] as const
        }
      }),
    ).then((pares) => {
      if (!vivo) return
      setRespuesta({ clave, intento, porId: Object.fromEntries(pares) })
    })

    return () => {
      vivo = false
    }
  }, [activo, clave, intento])

  const listaIds = clave === "" ? [] : clave.split(",").map(Number)
  const actual =
    respuesta && respuesta.clave === clave && respuesta.intento === intento ? respuesta.porId : null
  const cargando = activo && listaIds.length > 0 && actual === null
  const porId = actual ?? {}
  const todasFallaron =
    activo && !cargando && listaIds.length > 0 && listaIds.every((id) => Boolean(porId[id]?.error))

  return {
    porId,
    cargando,
    todasFallaron,
    reintentar: () => setIntento((valor) => valor + 1),
  }
}
