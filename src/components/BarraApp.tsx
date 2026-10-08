import { ChevronDown, Clapperboard, Film, LogOut, Search } from "lucide-react"
import { useEffect, useId, useRef, useState } from "react"
import { NavLink } from "react-router-dom"
import { AvatarCine } from "./AvatarCine"

interface BarraAppProps {
  correo: string
  nombre: string
  onSalir: () => void
}

export function BarraApp({ correo, nombre, onSalir }: BarraAppProps) {
  const [abierto, setAbierto] = useState(false)
  const menuId = useId()
  const perfilRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!abierto) return

    function cerrarSiSale(evento: MouseEvent) {
      if (!perfilRef.current?.contains(evento.target as Node)) setAbierto(false)
    }

    function cerrarConEscape(evento: KeyboardEvent) {
      if (evento.key === "Escape") setAbierto(false)
    }

    document.addEventListener("mousedown", cerrarSiSale)
    document.addEventListener("keydown", cerrarConEscape)
    return () => {
      document.removeEventListener("mousedown", cerrarSiSale)
      document.removeEventListener("keydown", cerrarConEscape)
    }
  }, [abierto])

  return (
    <header className="barra">
      <NavLink to="/" className="marca" end>
        <span className="marca-sello" aria-hidden="true">
          <Film size={18} strokeWidth={1.75} />
        </span>
        <span className="marca-nombre">
          Mi <em>Cartelera</em>
        </span>
      </NavLink>
      <nav className="nav" aria-label="Secciones">
        <NavLink to="/" end className={({ isActive }) => (isActive ? "activo" : undefined)}>
          <Clapperboard size={16} strokeWidth={1.75} aria-hidden />
          Inicio
        </NavLink>
        <NavLink to="/buscar" className={({ isActive }) => (isActive ? "activo" : undefined)}>
          <Search size={16} strokeWidth={1.75} aria-hidden />
          Buscar
        </NavLink>
      </nav>
      <div className="sesion" ref={perfilRef}>
        <button
          type="button"
          className="perfil"
          aria-expanded={abierto}
          aria-controls={menuId}
          onClick={() => setAbierto((valor) => !valor)}
        >
          <AvatarCine />
          <span className="identidad">
            {nombre ? <span className="nombre-usuario">{nombre}</span> : null}
            <span className="correo" title={correo}>
              {correo}
            </span>
          </span>
          <ChevronDown
            size={14}
            strokeWidth={1.75}
            aria-hidden
            className={abierto ? "perfil-flecha abierta" : "perfil-flecha"}
          />
        </button>
        {abierto ? (
          <div className="perfil-menu" id={menuId} role="menu">
            <button type="button" className="perfil-salir" role="menuitem" onClick={onSalir}>
              <LogOut size={16} strokeWidth={1.75} aria-hidden />
              Salir
            </button>
          </div>
        ) : null}
      </div>
    </header>
  )
}
