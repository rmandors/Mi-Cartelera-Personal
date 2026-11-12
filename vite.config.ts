import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

const entorno = globalThis as typeof globalThis & {
  process?: { env?: Record<string, string | undefined> }
}

export default defineConfig({
  base: entorno.process?.env?.VITE_BASE || "/",
  plugins: [react()],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    passWithNoTests: true,
  },
})
