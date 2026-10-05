interface CampoProps {
  id: string
  etiqueta: string
  tipo: "email" | "password" | "text"
  valor: string
  onChange: (valor: string) => void
  autoComplete: string
  placeholder?: string
  nota?: string
}

export function Campo({ id, etiqueta, tipo, valor, onChange, autoComplete, placeholder, nota }: CampoProps) {
  return (
    <label className="campo" htmlFor={id}>
      <span>
        {etiqueta}
        {nota ? <span className="campo-nota">{nota}</span> : null}
      </span>
      <input
        id={id}
        type={tipo}
        value={valor}
        autoComplete={autoComplete}
        placeholder={placeholder}
        onChange={(evento) => onChange(evento.target.value)}
      />
    </label>
  )
}
