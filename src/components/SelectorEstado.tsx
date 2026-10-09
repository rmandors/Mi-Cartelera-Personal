import { ESTADOS, ETIQUETA_ESTADO, type EstadoVisualizacion } from "../types/catalogo"

interface SelectorEstadoProps {
  valor: EstadoVisualizacion
  onChange: (estado: EstadoVisualizacion) => void
  etiqueta: string
  deshabilitado?: boolean
}

export function SelectorEstado({
  valor,
  onChange,
  etiqueta,
  deshabilitado = false,
}: SelectorEstadoProps) {
  return (
    <label className="selector-estado">
      <span>{etiqueta}</span>
      <select
        value={valor}
        disabled={deshabilitado}
        onChange={(evento) => onChange(evento.target.value as EstadoVisualizacion)}
      >
        {ESTADOS.map((estado) => (
          <option key={estado} value={estado}>
            {ETIQUETA_ESTADO[estado]}
          </option>
        ))}
      </select>
    </label>
  )
}
