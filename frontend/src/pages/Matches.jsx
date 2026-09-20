import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import NavApp from '../components/NavApp'
import Tarjeta from '../components/Tarjeta'
import Denunciar from '../components/Denunciar'
import { useIdioma } from '../lib/i18n'
import '../styles/app.css'

export default function Matches() {
  const { usuario, marcarMatchesVistos } = useAuth()
  const { t } = useIdioma()
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

  /** Quitarse un match de encima: dejáis de veros el teléfono. */
  const eliminarMatch = async (m) => {
    if (!confirm(
      t('confirmarEliminarMatch', { nombre: m.nombre })
    )) return

    const { error: errorEliminar } = await supabase.rpc('eliminar_match', { otro: m.id })

    if (errorEliminar) {
      setError(
        errorEliminar.message.includes('Could not find the function')
          ? 'Falta ejecutar supabase/15_deshacer_y_eliminar.sql en Supabase'
          : errorEliminar.message
      )
      return
    }
    setLista((prev) => prev.filter((x) => x.id !== m.id))
  }

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
          <h1>{t('tusMatches')}</h1>
          <p>{t('subtituloMatches')}</p>
        </header>

        {error && <div className="aviso aviso--error">{error}</div>}
        {cargando && <p className="mazo-vacio">{t('cargando')}</p>}

        {!cargando && lista.length === 0 && (
          <div className="mazo-vacio">
            <p>{t('sinMatches')}</p>
            <p className="tenue">{t('sinMatchesNota')}</p>
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
                    <span>{t('yaTeValoro', { n: yaMeValoraron[m.id] })}</span>
                  ) : (
                    <>
                      <span>{t('peticionEnviada')}</span>
                      <button
                        className="boton-retirar"
                        disabled={enviando === m.id}
                        onClick={() => pedirValoracion(m.id, false)}
                      >
                        {enviando === m.id ? t('retirando') : t('retirar')}
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
                  {enviando === m.id ? t('enviando') : t('pedirValoracion')}
                </button>
              )}
              </>)}

              <div className="acciones-match">
                <Denunciar perfil={m} compacto />
                <button className="boton-eliminar-match" onClick={() => eliminarMatch(m)}>
                  {t('eliminarMatch')}
                </button>
              </div>
            </Tarjeta>
          ))}
        </div>
      </main>
    </div>
  )
}
