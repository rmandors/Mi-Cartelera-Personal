import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { MarcoApp } from "./components/MarcoApp"
import { RutaProtegida, SoloInvitados } from "./components/RutaProtegida"
import { AuthProvider } from "./context/AuthContext"
import { Ajustes } from "./pages/Ajustes"
import { Buscar } from "./pages/Buscar"
import { Detalle } from "./pages/Detalle"
import { Login } from "./pages/Login"
import { MiLista } from "./pages/MiLista"
import { Registro } from "./pages/Registro"

export default function App() {
  return (
    <BrowserRouter>
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
