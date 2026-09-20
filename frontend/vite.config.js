import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],

  // Rutas relativas al construir.
  //
  // La web puede acabar en dos sitios: en el dominio propio
  // (cleanderapp.com/) o en la dirección de GitHub, que cuelga de una
  // subcarpeta (isabelsimonalonso.github.io/cleanderapp/). Con rutas
  // relativas funciona en los dos sin tener que tocar nada, y se puede
  // cambiar de uno a otro sin reconstruir.
  //
  // Es seguro porque usamos HashRouter: todas las rutas van después del
  // «#», así que el navegador nunca pide una dirección más profunda que
  // index.html y «./» siempre apunta a donde están los archivos.
  //
  // En local se sirve desde la raíz, para que baste con http://localhost:3000
  base: command === 'build' ? './' : '/',

  server: {
    port: 3000,
    open: false,
  },
}))
