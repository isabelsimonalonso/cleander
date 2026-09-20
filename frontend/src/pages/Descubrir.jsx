import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { COPY } from '../lib/constantes'
import { PROVINCIAS, municipiosDe } from '../lib/ubicacion'
import SelectorServicio from '../components/SelectorServicio'
import { useAuth } from '../context/AuthContext'
import NavApp from '../components/NavApp'
import Tarjeta from '../components/Tarjeta'
import Denunciar from '../components/Denunciar'
import '../styles/app.css'

const UMBRAL_ARRASTRE = 110 // píxeles que hay que arrastrar para que cuente

export default function Descubrir() {
  const { usuario, rol, refrescarMatchesNuevos } = useAuth()
  const [mazo, setMazo] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [filtros, setFiltros] = useState({ categoria: '', provincia: '', municipio: '', precio: '' })
  const [ultima, setUltima] = useState(null)   // para poder deshacer
  const [municipios, setMunicipios] = useState([])
  const [matchNuevo, setMatchNuevo] = useState(null)
  const [arrastre, setArrastre] = useState(0)
  const [saliendo, setSaliendo] = useState(null) // 'like' | 'pass'
  const inicioX = useRef(null)

  const copy = COPY[rol === 'servicio' ? 'servicio' : 'cliente']
  const actual = mazo[0] ?? null

  const cargarMazo = useCallback(async () => {
    setCargando(true)
    setError('')
    const { data, error: errorRpc } = await supabase.rpc('descubrir', {
      filtro_categoria: filtros.categoria || null,
      filtro_provincia: filtros.provincia || null,
      filtro_municipio: filtros.municipio || null,
      precio_maximo: filtros.precio ? Number(filtros.precio) : null,
      limite: 40,
    })
    if (errorRpc) setError(errorRpc.message)
    setMazo(data ?? [])
    setCargando(false)
  }, [filtros.categoria, filtros.provincia, filtros.municipio, filtros.precio])

  useEffect(() => { cargarMazo() }, [cargarMazo])

  // Los municipios del filtro se cargan al elegir provincia
  useEffect(() => {
    let activo = true
    municipiosDe(filtros.provincia).then((l) => { if (activo) setMunicipios(l) })
    return () => { activo = false }
  }, [filtros.provincia])

  const decidir = async (decision) => {
    if (!actual || saliendo) return

    setSaliendo(decision)
    const receptor = actual.id

    const { error: errorInteres } = await supabase
      .from('intereses')
      .upsert({ emisor: usuario.id, receptor, decision }, { onConflict: 'emisor,receptor' })

    if (errorInteres) {
      setError(errorInteres.message)
      setSaliendo(null)
      setArrastre(0)
      return
    }

    // ¿El trigger de la base de datos ha creado un match?
    if (decision === 'like') {
      const [a, b] = [usuario.id, receptor].sort()
      const { data: match } = await supabase
        .from('matches')
        .select('id')
        .eq('usuario_a', a)
        .eq('usuario_b', b)
        .maybeSingle()
      if (match) {
        setMatchNuevo(actual)
        refrescarMatchesNuevos()
      }
    }

    setUltima(actual)

    // Damos tiempo a que se vea la animación de salida
    setTimeout(() => {
      setMazo((prev) => prev.slice(1))
      setArrastre(0)
      setSaliendo(null)
    }, 220)
  }

  /** Devuelve al mazo la última tarjeta descartada. */
  const deshacer = async () => {
    if (!ultima) return
    const { error: errorDeshacer } = await supabase
      .from('intereses')
      .delete()
      .eq('emisor', usuario.id)
      .eq('receptor', ultima.id)

    if (errorDeshacer) {
      setError(errorDeshacer.message)
      return
    }
    setMazo((prev) => [ultima, ...prev])
    setUltima(null)
  }

  // ── Gesto de arrastre ────────────────────────────────────────────────
  const alPulsar = (e) => {
    if (saliendo) return
    inicioX.current = e.clientX
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const alMover = (e) => {
    if (inicioX.current === null) return
    setArrastre(e.clientX - inicioX.current)
  }
  const alSoltar = () => {
    if (inicioX.current === null) return
    const dx = arrastre
    inicioX.current = null
    if (dx > UMBRAL_ARRASTRE) decidir('like')
    else if (dx < -UMBRAL_ARRASTRE) decidir('pass')
    else setArrastre(0)
  }

  const desplazamiento = saliendo === 'like' ? 600 : saliendo === 'pass' ? -600 : arrastre
  const estiloTarjeta = {
    transform: `translateX(${desplazamiento}px) rotate(${desplazamiento / 22}deg)`,
    transition: inicioX.current === null
      ? 'transform .22s ease-out, opacity .22s ease-out'
      : 'none',
    opacity: saliendo ? 0 : 1,
  }

  return (
    <div className="app-layout">
      <NavApp />

      <main className="app-main">
        <header className="app-cabecera">
          <h1>{copy.descubrir}</h1>
          <p>Desliza a la derecha si te interesa, a la izquierda si no.</p>
        </header>

        <div className="filtros">
          <SelectorServicio
            className="filtro-ancho"
            value={filtros.categoria}
            requerido={false}
            placeholder="Todos los servicios"
            onChange={(e) => setFiltros((f) => ({ ...f, categoria: e.target.value }))}
          />
          <select
            value={filtros.provincia}
            onChange={(e) =>
              setFiltros((f) => ({ ...f, provincia: e.target.value, municipio: '' }))
            }
          >
            <option value="">Toda España</option>
            {PROVINCIAS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select
            value={filtros.municipio}
            disabled={!filtros.provincia}
            onChange={(e) => setFiltros((f) => ({ ...f, municipio: e.target.value }))}
          >
            <option value="">
              {filtros.provincia ? 'Toda la provincia' : 'Elige antes provincia'}
            </option>
            {municipios.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <select
            value={filtros.precio}
            onChange={(e) => setFiltros((f) => ({ ...f, precio: e.target.value }))}
          >
            <option value="">Cualquier precio</option>
            {[10, 15, 20, 25, 30, 40, 50].map((p) => (
              <option key={p} value={p}>Hasta {p} €</option>
            ))}
          </select>
        </div>

        {error && <div className="aviso aviso--error">{error}</div>}

        <div className="mazo">
          {cargando && <p className="mazo-vacio">Buscando…</p>}

          {!cargando && !actual && (
            <div className="mazo-vacio">
              <p>No queda nadie por ver con estos filtros.</p>
              <button onClick={cargarMazo}>Volver a buscar</button>
            </div>
          )}

          {actual && (
            <>
              {/* La siguiente tarjeta asoma por detrás para dar sensación de mazo */}
              {mazo[1] && (
                <div className="mazo-fondo" key={`fondo-${mazo[1].id}`}>
                  <Tarjeta perfil={mazo[1]} />
                </div>
              )}

              {/* La `key` es imprescindible: sin ella React reutiliza este mismo
                  elemento para la tarjeta siguiente, y el navegador la anima
                  "de vuelta" desde donde salió volando la anterior. */}
              <div
                key={actual.id}
                className="mazo-frente"
                style={estiloTarjeta}
                onPointerDown={alPulsar}
                onPointerMove={alMover}
                onPointerUp={alSoltar}
                onPointerCancel={alSoltar}
              >
                {arrastre > 60 && <span className="sello sello--like">ME INTERESA</span>}
                {arrastre < -60 && <span className="sello sello--pass">PASO</span>}
                <Tarjeta perfil={actual} />
              </div>
            </>
          )}
        </div>

        {actual && (
          <div className="pie-mazo">
            <Denunciar perfil={actual} compacto />
          </div>
        )}

        {actual && (
          <div className="acciones">
            <button
              className="accion accion--deshacer"
              disabled={!ultima}
              title={ultima ? `Recuperar a ${ultima.nombre}` : 'Nada que deshacer'}
              onClick={deshacer}
            >
              ↺
            </button>
            <button className="accion accion--pass" onClick={() => decidir('pass')}>✕</button>
            <button className="accion accion--like" onClick={() => decidir('like')}>♥</button>
          </div>
        )}
      </main>

      {matchNuevo && (
        <div className="modal-match" onClick={() => setMatchNuevo(null)}>
          <div className="modal-match-caja" onClick={(e) => e.stopPropagation()}>
            <h2>¡Es un match!</h2>
            <p>
              Tú y <strong>{matchNuevo.nombre}</strong> os habéis elegido.
              Ya podéis ver vuestros teléfonos en la sección Matches.
            </p>
            <button onClick={() => setMatchNuevo(null)}>Seguir mirando</button>
          </div>
        </div>
      )}
    </div>
  )
}
