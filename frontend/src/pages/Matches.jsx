import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import NavApp from '../components/NavApp'
import Tarjeta from '../components/Tarjeta'
import Denunciar from '../components/Denunciar'
import '../styles/app.css'

export default function Matches() {
  const { usuario, marcarMatchesVistos } = useAuth()
  const [lista, setLista] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(null)   // id del match en curso
  const [yaMeValoraron, setYaMeValoraron] = useState({})

  const cargar = useCallback(async () => {
    setCargando(true)
    const [{ data, error: errorRpc }, { data: votos }] = await Promise.all([
      supabase.rpc('mis_matches'),
      supabase.from('valoraciones').select('autor,estrellas').eq('destinatario', usuario.id),
    ])
    if (errorRpc) setError(errorRpc.message)
    setLista(data ?? [])
    setYaMeValoraron(Object.fromEntries((votos ?? []).map((v) => [v.autor, v.estrellas])))
    setCargando(false)
  }, [usuario.id])

  useEffect(() => { cargar() }, [cargar])

  // Con solo abrir esta pantalla, el aviso rojo se apaga.
  useEffect(() => {
    marcarMatchesVistos(usuario?.id)
  }, [marcarMatchesVistos, usuario?.id])

  const pedirValoracion = async (otro, activar) => {
    if (enviando) return              // una petición cada vez
    setEnviando(otro)
    setError('')

    const { data, error: errorPeticion } = await supabase.rpc('pedir_valoracion', {
      otro,
      activar,
    })

    setEnviando(null)

    if (errorPeticion) {
      setError(
        errorPeticion.message.includes('Could not find the function')
          ? 'Falta ejecutar supabase/05_valoraciones_por_invitacion.sql en Supabase'
          : errorPeticion.message
      )
      return
    }
    if (data === false) {
      setError('No se encontró ese match')
      return
    }

    setLista((prev) =>
      prev.map((m) => (m.id === otro ? { ...m, he_pedido_valoracion: activar } : m))
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
              {m.suspendido ? null : (<>
              {m.he_pedido_valoracion ? (
                <div className="invitacion-enviada">
                  {yaMeValoraron[m.id] ? (
                    // Ya te ha valorado: retirar la petición no borraría su voto,
                    // así que no se ofrece para no confundir.
                    <span>Ya te ha valorado con {yaMeValoraron[m.id]} estrellas</span>
                  ) : (
                    <>
                      <span>Petición de valoración enviada</span>
                      <button
                        className="boton-retirar"
                        disabled={enviando === m.id}
                        onClick={() => pedirValoracion(m.id, false)}
                      >
                        {enviando === m.id ? 'Retirando…' : 'Retirar'}
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <button
                  className="boton-invitar"
                  disabled={enviando === m.id}
                  onClick={() => pedirValoracion(m.id, true)}
                >
                  {enviando === m.id ? 'Enviando…' : 'Pedirle que me valore'}
                </button>
              )}
              </>)}

              <div className="acciones-match">
                <Denunciar perfil={m} compacto />
                <button className="boton-eliminar-match" onClick={() => eliminarMatch(m)}>
                  Eliminar match
                </button>
              </div>
            </Tarjeta>
          ))}
        </div>
      </main>
    </div>
  )
}
