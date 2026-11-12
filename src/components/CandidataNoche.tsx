import { Aviso } from "./Aviso"
import { Poster } from "./Poster"

interface AccionNoche {
  etiqueta: string
  variante: "primaria" | "linea"
  onClick: () => void
}

interface CandidataNocheProps {
  titulo: string
  posterUrl: string | null
  detalle: string
  aviso?: string | null
  accion?: AccionNoche
}

export function CandidataNoche({ titulo, posterUrl, detalle, aviso, accion }: CandidataNocheProps) {
  return (
    <article className="ticket">
      <div className="ticket-poster">
        <Poster url={posterUrl} titulo={titulo} tamano="boleto" decorativo />
      </div>
      <div className="ticket-cuerpo">
        <p className="kicker">{detalle}</p>
        <h2>{titulo}</h2>
        {aviso ? <Aviso>{aviso}</Aviso> : null}
        {accion ? (
          <div className="ticket-acciones">
            <button
              type="button"
              className={accion.variante === "linea" ? "boton linea" : "boton"}
              onClick={accion.onClick}
            >
              {accion.etiqueta}
            </button>
          </div>
        ) : null}
      </div>
    </article>
  )
}
