interface EstadoCargaProps {
  mensaje: string
}

export function EstadoCarga({ mensaje }: EstadoCargaProps) {
  return (
    <p className="estado-carga" role="status">
      {mensaje}
    </p>
  )
}
