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
          <em>sin la de nadie más.</em>
        </h1>
        <p className="acceso-texto">
          Lo que quieres ver, lo que estás viendo y lo que ya viste. Cada cuenta guarda la suya.
        </p>
      </section>
      <section className="acceso-formulario">{children}</section>
    </main>
  )
}
