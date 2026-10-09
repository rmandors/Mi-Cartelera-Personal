import { Trash2 } from "lucide-react"
import { useEffect, useId, useRef } from "react"
import { Aviso } from "./Aviso"

interface DialogoProps {
  abierto: boolean
  titulo: string
  texto: string
  confirmar: string
  ocupado?: boolean
  error?: string | null
  onConfirmar: () => void
  onCerrar: () => void
}

export function Dialogo({
  abierto,
  titulo,
  texto,
  confirmar,
  ocupado = false,
  error,
  onConfirmar,
  onCerrar,
}: DialogoProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const tituloId = useId()

  useEffect(() => {
    const nodo = ref.current
    if (!nodo) return
    if (abierto && !nodo.open) nodo.showModal()
    if (!abierto && nodo.open) nodo.close()
  }, [abierto])

  return (
    <dialog
      ref={ref}
      className="dialogo"
      aria-labelledby={tituloId}
      onCancel={(evento) => {
        if (ocupado) evento.preventDefault()
      }}
      onClose={onCerrar}
      onClick={(evento) => {
        if (evento.target === evento.currentTarget && !ocupado) onCerrar()
      }}
    >
      <h2 id={tituloId}>{titulo}</h2>
      <p>{texto}</p>
      {error ? <Aviso>{error}</Aviso> : null}
      <div className="dialogo-acciones">
        <button type="button" className="boton linea" onClick={onCerrar} disabled={ocupado}>
          Cancelar
        </button>
        <button type="button" className="boton peligro" onClick={onConfirmar} disabled={ocupado}>
          <Trash2 size={16} strokeWidth={1.75} aria-hidden />
          {confirmar}
        </button>
      </div>
    </dialog>
  )
}
