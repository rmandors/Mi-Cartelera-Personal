import { PAUSA_MINUTOS, duracionTotal } from "../dominio/noche"
import { Aviso } from "./Aviso"

export interface ElegidaNoche {
  id: number
  titulo: string
  duracion: number
}

interface ResumenSesionProps {
  tiempo: number
  elegidas: readonly ElegidaNoche[]
  aviso: string | null
  avisoTono?: "error" | "ok"
  nombre: string
  onNombre: (valor: string) => void
  onGuardar: () => void
  guardando: boolean
  onQuitar: (id: number) => void
  onLlenar: () => void
}

export function ResumenSesion({
  tiempo,
  elegidas,
  aviso,
  avisoTono = "error",
  nombre,
  onNombre,
  onGuardar,
  guardando,
  onQuitar,
  onLlenar,
}: ResumenSesionProps) {
  const total = duracionTotal(
    elegidas.map((pelicula) => pelicula.duracion),
    PAUSA_MINUTOS,
  )
  const restante = tiempo - total
  const pausas = Math.max(0, elegidas.length - 1)

  return (
    <aside className="noche-resumen" aria-live="polite">
      <p className="kicker">Tu noche</p>
      <p className="meta">
        {total} min en total · quedan {restante} min
      </p>
      <p className="meta">
        {pausas === 0
          ? "Sin pausa."
          : `${pausas} ${pausas === 1 ? "pausa" : "pausas"} de ${PAUSA_MINUTOS} min, entre película y película.`}
      </p>
      {elegidas.length === 0 ? (
        <p className="meta">Todavía no agregas películas.</p>
      ) : (
        <ul className="noche-elegidas">
          {elegidas.map((pelicula) => (
            <li key={pelicula.id}>
              <span>
                {pelicula.titulo}
                <span className="meta"> · {pelicula.duracion} min</span>
              </span>
              <button type="button" className="boton linea" onClick={() => onQuitar(pelicula.id)}>
                Quitar
              </button>
            </li>
          ))}
        </ul>
      )}
      <label className="campo" htmlFor="nombre-noche">
        <span>Nombre</span>
        <input
          id="nombre-noche"
          type="text"
          maxLength={60}
          value={nombre}
          placeholder="Sábado en casa"
          onChange={(evento) => onNombre(evento.target.value)}
        />
      </label>
      <button className="boton linea" type="button" onClick={onLlenar}>
        Llenar la noche
      </button>
      <button className="boton" type="button" onClick={onGuardar} disabled={guardando}>
        {guardando ? "Guardando…" : "Guardar la noche"}
      </button>
      {aviso ? <Aviso tono={avisoTono}>{aviso}</Aviso> : null}
    </aside>
  )
}
