import type { ReactNode } from "react"

interface AvisoProps {
  tono?: "error" | "ok"
  children: ReactNode
}

export function Aviso({ tono = "error", children }: AvisoProps) {
  return (
    <p className={tono === "ok" ? "aviso ok" : "aviso"} role={tono === "ok" ? "status" : "alert"}>
      {children}
    </p>
  )
}
