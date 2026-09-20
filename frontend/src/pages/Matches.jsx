import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import NavApp from '../components/NavApp'
import Tarjeta from '../components/Tarjeta'
import Estrellas from '../components/Estrellas'
import '../styles/app.css'

export default function Matches() {
  const { usuario, marcarMatchesVistos } = useAuth()
  const [lista, setLista] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const cargar = useCallback(async () => {
    setCargando(true)
    const { data, error: errorRpc } = await supabase.rpc('mis_matches')
    if (errorRpc) setError(errorRpc.message)
    setLista(data ?? [])
    setCargando(false)
  }, [])

  useEffect(() => { cargar() }, [cargar])

  // Con solo abrir esta pantalla, el aviso rojo se apaga.
  useEffect(() => {
    marcarMatchesVistos(usuario?.id)
  }, [marcarMatchesVistos, usuario?.id])

  const pedirValoracion = async (otro, activar) => {
    const { error: errorPeticion } = await supabase.rpc('pedir_valoracion', {
      otro,
      activar,
    })
    if (errorPeticion) {
      setError(errorPeticion.message)
      return
    }
    setLista((prev) =>
      prev.map((m) => (m.id === otro ? { ...m, he_pedido_valoracion: activar } : m))
    )
  }

  const votar = async (destinatario, estrellas) => {
    const { error: errorVoto } = await supabase
      .from('valoraciones')
      .upsert({ autor: usuario.id, destinatario, estrellas }, { onConflict: 'autor,destinatario' })

    if (errorVoto) {
      setError(errorVoto.message)
      return
    }
    // Reflejamos el voto al momento sin esperar a recargar todo
    setLista((prev) =>
      prev.map((m) => (m.id === destinatario ? { ...m, mi_voto: estrellas } : m))
    )
  }

  return (
    <div className="app-layout">
      <NavApp />
      <main className="app-main">
        <header className="app-cabecera">
          <h1>Tus matches</h1>
          <p>Aquí ya podéis veros el teléfono y hablar por WhatsApp.</p>
        </header>

        {error && <div className="aviso aviso--error">{error}</div>}
        {cargando && <p className="mazo-vacio">Cargando…</p>}

        {!cargando && lista.length === 0 && (
          <div className="mazo-vacio">
            <p>Todavía no tienes ningún match.</p>
            <p className="tenue">
              Hace falta que las dos partes se marquen mutuamente.
            </p>
          </div>
        )}

        <div className="rejilla">
          {lista.map((m) => (
            <Tarjeta key={m.id} perfil={m} telefono={m.telefono}>
              <div className="votacion">
                <span>
                  {m.puedo_valorar
                    ? `${m.nombre.split(' ')[0]} te pide que le valores`
                    : 'Aún no te ha pedido valoración'}
                </span>
                <Estrellas
                  valor={m.mi_voto ?? 0}
                  onVotar={m.puedo_valorar ? (n) => votar(m.id, n) : null}
                  tamano={22}
                />
              </div>

              <button
                className={`boton-invitar ${m.he_pedido_valoracion ? 'boton-invitar--puesta' : ''}`}
                onClick={() => pedirValoracion(m.id, !m.he_pedido_valoracion)}
              >
                {m.he_pedido_valoracion
                  ? 'Valoración pedida · retirar'
                  : 'Pedirle que me valore'}
              </button>
            </Tarjeta>
          ))}
        </div>
      </main>
    </div>
  )
}
