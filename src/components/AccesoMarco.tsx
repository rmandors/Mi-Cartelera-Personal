import type { ReactNode } from "react"

interface AccesoMarcoProps {
  children: ReactNode
}

export function AccesoMarco({ children }: AccesoMarcoProps) {
  return (
    <main className="acceso">
      <section className="acceso-marca">
        <p className="kicker">Cineclub</p>
        <h1>
          Tu cartelera,
          <br />
          <em>
            sin la de
            <br />
            nadie más.
          </em>
        </h1>
        <p className="acceso-texto">
          Una butaca solo para ti. Lo que anotas aquí no se sienta en la fila de nadie más.
        </p>
      </section>
      <section className="acceso-formulario">{children}</section>
    </main>
  )
}
