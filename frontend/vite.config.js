import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `base` debe coincidir con el nombre del repositorio en GitHub Pages:
// https://isabelsimonalonso.github.io/cleander/
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE ?? '/cleander/',
  server: {
    port: 3000,
  },
})
