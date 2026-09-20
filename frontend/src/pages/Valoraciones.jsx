import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import NavApp from '../components/NavApp'
import Estrellas from '../components/Estrellas'
import '../styles/app.css'

/** Ficha compacta: foto o iniciales, nombre y servicio. */
function Ficha({ persona }) {
  const iniciales = (persona.nombre || '?')
    .split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase()

  return (
    <div className="ficha">
      {persona.foto_url
        ? <img src={persona.foto_url} alt="" />
        : <span className="ficha-iniciales">{iniciales}</span>}
      <div>
        <strong>{persona.nombre}</strong>
        <small>{persona.categoria} · {persona.ciudad}</small>
      </div>
    </div>
  )
}

export default function Valoraciones() {
  const { usuario, refrescarValoraciones } = useAuth()
  const [matches, setMatches] = useState([])
  const [recibidas, setRecibidas] = useState({})   // quién me ha votado a mí
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const cargar = useCallback(async () => {
    setCargando(true)

    const [{ data: lista, error: errorLista }, { data: votos }] = await Promise.all([
      supabase.rpc('mis_matches'),
      supabase.from('valoraciones').select('autor,estrellas').eq('destinatario', usuario.id),
    ])

    if (errorLista) setError(errorLista.message)
    setMatches(lista ?? [])
    setRecibidas(Object.fromEntries((votos ?? []).map((v) => [v.autor, v.estrellas])))
    setCargando(false)
  }, [usuario.id])

  useEffect(() => { cargar() }, [cargar])

  const votar = async (destinatario, estrellas, nombre) => {
    setError('')

    // El voto no se puede deshacer: mejor avisar antes.
    const plural = estrellas === 1 ? 'estrella' : 'estrellas'
    if (!confirm(
      `Vas a valorar a ${nombre} con ${estrellas} ${plural}.\n\n` +
      'La valoración es definitiva: no podrás cambiarla ni retirarla después.'
    )) return

    const { error: errorVoto } = await supabase
      .from('valoraciones')
      .insert({ autor: usuario.id, destinatario, estrellas })

    if (errorVoto) {
      const mensajes = {
        '42501': 'Esa persona ha retirado su petición de valoración',
        '23505': 'Ya la has valorado, y la valoración no se puede cambiar',
      }
      setError(mensajes[errorVoto.code] ?? errorVoto.message)
      return
    }
    setMatches((prev) =>
      prev.map((m) => (m.id === destinatario ? { ...m, mi_voto: estrellas } : m))
    )
    refrescarValoraciones()
  }

  const { pendientes, hechas, pedidas } = useMemo(() => ({
    // Me piden que les valore y aún no lo he hecho
    pendientes: matches.filter((m) => m.puedo_valorar && !m.mi_voto),
    // Ya les he votado
    hechas: matches.filter((m) => m.mi_voto),
    // Les he pedido yo que me valoren
    pedidas: matches.filter((m) => m.he_pedido_valoracion),
  }), [matches])

  return (
    <div className="app-layout">
      <NavApp />
      <main className="app-main">
        <header className="app-cabecera">
          <h1>Valoraciones</h1>
          <p>
            Solo puedes puntuar a quien te lo haya pedido, y una sola vez:
            la valoración no se puede cambiar.
          </p>
        </header>

        {error && <div className="aviso aviso--error">{error}</div>}
        {cargando && <p className="mazo-vacio">Cargando…</p>}

        {!cargando && (
          <>
            {/* ── Te piden que les valores ───────────────────────────── */}
            <section className="bloque">
              <h2 className="bloque-titulo">
                Te piden que les valores
                {pendientes.length > 0 && (
                  <span className="bloque-cuenta">{pendientes.length}</span>
                )}
              </h2>

              {pendientes.length === 0 ? (
                <p className="bloque-vacio">Nadie te ha pedido valoración por ahora.</p>
              ) : (
                pendientes.map((m) => (
                  <div className="linea-valoracion linea-valoracion--destacada" key={m.id}>
                    <Ficha persona={m} />
                    <Estrellas
                      valor={0}
                      onVotar={(n) => votar(m.id, n, m.nombre)}
                      tamano={26}
                    />
                  </div>
                ))
              )}
            </section>

            {/* ── Ya valoradas ──────────────────────────────────────── */}
            {hechas.length > 0 && (
              <section className="bloque">
                <h2 className="bloque-titulo">Ya has valorado</h2>
                {hechas.map((m) => (
                  <div className="linea-valoracion" key={m.id}>
                    <Ficha persona={m} />
                    <div className="linea-derecha">
                      <Estrellas valor={m.mi_voto} tamano={22} />
                      <small>definitiva</small>
                    </div>
                  </div>
                ))}
              </section>
            )}

            {/* ── Las que has pedido tú ─────────────────────────────── */}
            <section className="bloque">
              <h2 className="bloque-titulo">Has pedido valoración a</h2>

              {pedidas.length === 0 ? (
                <p className="bloque-vacio">
                  No has pedido ninguna. Puedes hacerlo desde cada match, en la
                  pestaña Matches.
                </p>
              ) : (
                pedidas.map((m) => (
                  <div className="linea-valoracion" key={m.id}>
                    <Ficha persona={m} />
                    <div className="linea-derecha">
                      {recibidas[m.id] ? (
                        <>
                          <Estrellas valor={recibidas[m.id]} tamano={22} />
                          <small>te ha valorado</small>
                        </>
                      ) : (
                        <small className="tenue">aún no te ha valorado</small>
                      )}
                    </div>
                  </div>
                ))
              )}
            </section>
          </>
        )}
      </main>
    </div>
  )
}
