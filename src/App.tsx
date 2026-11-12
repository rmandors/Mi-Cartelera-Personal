import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { MarcoApp } from "./components/MarcoApp"
import { RutaProtegida, SoloInvitados } from "./components/RutaProtegida"
import { AuthProvider } from "./context/AuthContext"
import { Ajustes } from "./pages/Ajustes"
import { Buscar } from "./pages/Buscar"
import { Detalle } from "./pages/Detalle"
import { Login } from "./pages/Login"
import { MiLista } from "./pages/MiLista"
import { NocheDePelicula } from "./pages/NocheDePelicula"
import { Registro } from "./pages/Registro"
import { SesionGuardada } from "./pages/SesionGuardada"

const basePublica = import.meta.env.BASE_URL.replace(/\/$/, "")

export default function App() {
  return (
    <BrowserRouter basename={basePublica || undefined}>
      <AuthProvider>
        <Routes>
          <Route element={<SoloInvitados />}>
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
          </Route>
          <Route element={<RutaProtegida />}>
            <Route element={<MarcoApp />}>
              <Route path="/" element={<MiLista />} />
              <Route path="/buscar" element={<Buscar />} />
              <Route path="/noche" element={<NocheDePelicula />} />
              <Route path="/noche/:id" element={<SesionGuardada />} />
              <Route path="/titulo/:id" element={<Detalle />} />
              <Route path="/ajustes" element={<Ajustes />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
