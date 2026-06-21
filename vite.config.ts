import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Honor a PORT env var (e.g. from the preview harness) so the dev server can
  // be assigned an open port instead of always grabbing 5173.
  server: process.env.PORT ? { port: Number(process.env.PORT) } : undefined,
})
