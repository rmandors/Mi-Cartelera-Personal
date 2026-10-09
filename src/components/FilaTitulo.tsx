import { Trash2 } from "lucide-react"
import { Link } from "react-router-dom"
import { ETIQUETA_TIPO, type EstadoVisualizacion, type ItemLista } from "../types/catalogo"
import { fechaCorta } from "../lib/texto"
import { Poster } from "./Poster"
import { SelectorEstado } from "./SelectorEstado"

interface FilaTituloProps {
  item: ItemLista
  onEstado: (estado: EstadoVisualizacion) => void
  onEliminar: () => void
  deshabilitado?: boolean
}

export function FilaTitulo({ item, onEstado, onEliminar, deshabilitado = false }: FilaTituloProps) {
  return (
    <article className="ticket">
      <Link
        to={`/titulo/${item.id}`}
        className="ticket-poster"
        aria-label={`Abrir ficha de ${item.titulo}`}
      >
        <Poster url={item.poster_url} titulo={item.titulo} tamano="boleto" decorativo />
      </Link>
      <div className="ticket-cuerpo">
        <p className="kicker">{ETIQUETA_TIPO[item.tipo_contenido]}</p>
        <h2>
          <Link to={`/titulo/${item.id}`}>{item.titulo}</Link>
        </h2>
        <p className="meta">
          Agregada el {fechaCorta(item.fecha_agregado)}
          {item.calificacion_personal != null ? ` · Tu nota ${item.calificacion_personal}/5` : ""}
        </p>
        <div className="ticket-acciones">
          <SelectorEstado
            valor={item.estado}
            onChange={onEstado}
            etiqueta="Estado"
            deshabilitado={deshabilitado}
          />
          <button type="button" className="boton peligro" onClick={onEliminar}>
            <Trash2 size={15} strokeWidth={1.75} aria-hidden />
            Eliminar
          </button>
        </div>
      </div>
    </article>
  )
}
