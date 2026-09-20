import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// En GitHub Pages la web cuelga de una subcarpeta con el nombre del
// repositorio. En lugar de escribirlo a mano, se toma de GITHUB_REPOSITORY,
// que GitHub Actions rellena solo: así renombrar el repositorio no rompe
// nada. Fuera de Actions se usa el valor de reserva.
const repositorio = process.env.GITHUB_REPOSITORY?.split('/')[1]
const RESERVA = 'cleanderapp'

export default defineConfig(({ command }) => ({
  plugins: [react()],

  // En local se sirve desde la raíz, para que baste con http://localhost:3000
  base: command === 'build' ? `/${repositorio ?? RESERVA}/` : '/',

  server: {
    port: 3000,
    open: false,
  },
}))
