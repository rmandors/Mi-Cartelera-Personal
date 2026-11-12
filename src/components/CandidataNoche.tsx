import { Aviso } from "./Aviso"
import { Poster } from "./Poster"

interface CandidataNocheProps {
  titulo: string
  posterUrl: string | null
  detalle: string
  aviso?: string | null
}

export function CandidataNoche({ titulo, posterUrl, detalle, aviso }: CandidataNocheProps) {
  return (
    <article className="ticket">
      <div className="ticket-poster">
        <Poster url={posterUrl} titulo={titulo} tamano="boleto" decorativo />
      </div>
      <div className="ticket-cuerpo">
        <p className="kicker">{detalle}</p>
        <h2>{titulo}</h2>
        {aviso ? <Aviso>{aviso}</Aviso> : null}
      </div>
    </article>
  )
}
