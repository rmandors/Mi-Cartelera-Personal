export function mensajeAuth(mensaje: string): string {
  const texto = mensaje.toLowerCase()
  if (texto.includes("invalid login credentials")) return "Correo o contraseña incorrectos."
  if (texto.includes("already registered") || texto.includes("already been registered")) {
    return "Ese correo ya está registrado."
  }
  if (texto.includes("password")) return "La contraseña debe tener al menos 6 caracteres."
  if (texto.includes("rate limit")) return "Demasiados intentos. Espera un momento."
  if (texto.includes("failed to fetch") || texto.includes("network")) {
    return "No hay conexión con Supabase."
  }
  return mensaje
}

