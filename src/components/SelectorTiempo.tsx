import type { FormEvent } from "react"

interface SelectorTiempoProps {
  valor: string
  onChange: (valor: string) => void
  onConfirmar: () => void
}

export function SelectorTiempo({ valor, onChange, onConfirmar }: SelectorTiempoProps) {
  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    onConfirmar()
  }

  return (
    <form className="buscador" onSubmit={enviar}>
      <label className="campo crecer" htmlFor="tiempo-noche">
        <span>Tiempo disponible</span>
        <input
          id="tiempo-noche"
          inputMode="numeric"
          autoComplete="off"
          placeholder="Minutos, de 30 a 600"
          value={valor}
          onChange={(evento) => onChange(evento.target.value)}
        />
      </label>
      <button className="boton" type="submit">
        Ver qué cabe
      </button>
    </form>
  )
}
