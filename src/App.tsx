import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { RutaProtegida, SoloInvitados } from "./components/RutaProtegida"
import { AuthProvider } from "./context/AuthContext"
import { Login } from "./pages/Login"
import { Registro } from "./pages/Registro"
import { Inicio } from "./pages/Inicio"

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
            <Route path="/" element={<Inicio />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
