import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],

  // Al construir para GitHub Pages, la web cuelga de /cleander/ (el nombre
  // del repositorio). En local se sirve desde la raíz, para que baste con
  // abrir http://localhost:3000
  base: command === 'build' ? '/cleander/' : '/',

  server: {
    port: 3000,
    open: false,
  },
}))
