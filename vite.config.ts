import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/opencode-agent-forge/",
  server: { port: 5173, strictPort: false },
  preview: { port: 4173, strictPort: false },
})
