import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { configuracionValida } from './lib/supabase'
import { leerEnlaceDeCorreo } from './lib/arranque'
import './styles/index.css'

const raiz = ReactDOM.createRoot(document.getElementById('root'))

const pintar = (modo) =>
  raiz.render(
    <React.StrictMode>
      <App modo={modo} />
    </React.StrictMode>,
  )

// Los enlaces de correo se resuelven antes de montar nada: ver arranque.js.
// Sin enlace que leer, la promesa se resuelve de inmediato y no se nota.
if (configuracionValida) {
  leerEnlaceDeCorreo().then(pintar, () => pintar('normal'))
} else {
  pintar('normal')
}
