export function mensajeAuth(mensaje: string): string {
  const texto = mensaje.toLowerCase()
  if (texto.includes("invalid login credentials")) return "Correo o contraseña incorrectos."
  if (texto.includes("already registered") || texto.includes("already been registered")) {
    return "Ese correo ya está registrado."
  }
  if (texto.includes("reauthentication") || texto.includes("reauthenticate")) {
    return "Por seguridad, cierra sesión, vuelve a entrar y cambia la contraseña enseguida."
  }
  if (texto.includes("different from the old")) {
    return "Elige una contraseña distinta a la actual."
  }
  if (texto.includes("unable to validate email") || texto.includes("invalid format")) {
    return "Escribe un correo válido."
  }
  if (texto.includes("password")) return "La contraseña debe tener al menos 6 caracteres."
  if (texto.includes("rate limit")) return "Demasiados intentos. Espera un momento."
  if (texto.includes("failed to fetch") || texto.includes("network")) {
    return "No hay conexión con Supabase."
  }
  return mensaje
}

export function mensajeBaja(mensaje: string, codigo?: string): string {
  const texto = mensaje.toLowerCase()
  if (
    codigo === "PGRST202" ||
    texto.includes("could not find the function") ||
    texto.includes("schema cache")
  ) {
    return "Para dar de baja, ejecuta de nuevo supabase/schema.sql en el SQL Editor."
  }
  if (texto.includes("permission denied")) {
    return "Supabase no dejó borrar la cuenta. En el SQL Editor ejecuta: alter function public.eliminar_cuenta() owner to supabase_auth_admin;"
  }
  return mensajeAuth(mensaje)
}
