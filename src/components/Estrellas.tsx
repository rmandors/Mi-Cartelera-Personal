interface EstrellasProps {
  valor: number | null
  onChange: (valor: number | null) => void
}

export function Estrellas({ valor, onChange }: EstrellasProps) {
  return (
    <div className="estrellas" role="radiogroup" aria-label="Calificación personal de 1 a 5">
      {[1, 2, 3, 4, 5].map((nota) => (
        <button
          key={nota}
          type="button"
          role="radio"
          aria-checked={valor === nota}
          className={valor != null && nota <= valor ? "llena" : undefined}
          aria-label={
            valor === nota ? `Quitar la calificación de ${nota}` : `Calificar con ${nota} de 5`
          }
          onClick={() => onChange(valor === nota ? null : nota)}
        >
          ★
        </button>
      ))}
    </div>
  )
}
