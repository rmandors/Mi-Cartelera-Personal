interface PosterProps {
  url: string | null
  titulo: string
  tamano?: "boleto" | "cartel" | "ficha"
  decorativo?: boolean
}

export function Poster({ url, titulo, tamano = "cartel", decorativo = false }: PosterProps) {
  if (!url) {
    return (
      <div className={`poster-marco ${tamano}`} aria-hidden="true">
        <span className="poster-letra">{titulo.slice(0, 1).toUpperCase()}</span>
      </div>
    )
  }

  return (
    <div className={`poster-marco ${tamano}`}>
      <img src={url} alt={decorativo ? "" : titulo} />
    </div>
  )
}
