import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import NavApp from '../components/NavApp'
import '../styles/app.css'
import '../styles/admin.css'

const ETIQUETA_ROL = { admin: 'Admin', cliente: 'Cliente', servicio: 'Servicio' }

export default function Admin() {
  const { usuario } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [stats, setStats] = useState({})
  const [busqueda, setBusqueda] = useState('')
  const [filtroRol, setFiltroRol] = useState('')
  const [soloPendientes, setSoloPendientes] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const cargar = useCallback(async () => {
    setCargando(true)
    const [{ data: lista, error: errorLista }, { data: numeros }] = await Promise.all([
      supabase.rpc('admin_usuarios'),
      supabase.rpc('admin_estadisticas'),
    ])
    if (errorLista) setError(errorLista.message)
    setUsuarios(lista ?? [])
    setStats(numeros ?? {})
    setCargando(false)
  }, [])

  useEffect(() => { cargar() }, [cargar])

  /** Aplica un cambio en la fila y refresca los contadores. */
  const actualizar = async (id, cambios) => {
    setError('')
    const { error: errorUpd } = await supabase.from('perfiles').update(cambios).eq('id', id)
    if (errorUpd) {
      setError(errorUpd.message)
      return
    }
    setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, ...cambios } : u)))
    supabase.rpc('admin_estadisticas').then(({ data }) => setStats(data ?? {}))
  }

  const borrar = async (u) => {
    if (!confirm(`Borrar definitivamente a ${u.nombre || u.email}?\n\nSe eliminarán su perfil, sus matches y sus valoraciones. No se puede deshacer.`)) {
      return
    }
    const { error: errorDel } = await supabase.rpc('admin_borrar_usuario', { objetivo: u.id })
    if (errorDel) {
      setError(errorDel.message)
      return
    }
    setUsuarios((prev) => prev.filter((x) => x.id !== u.id))
    cargar()
  }

  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return usuarios.filter((u) => {
      // Tu propia fila no pinta nada aquí: no puedes moderarte ni borrarte.
      if (u.id === usuario.id) return false
      if (filtroRol && u.rol !== filtroRol) return false
      if (soloPendientes && !(u.resumen && u.resumen_estado === 'pendiente')) return false
      if (!texto) return true
      return [u.nombre, u.email, u.ciudad, u.categoria, u.telefono]
        .filter(Boolean)
        .some((campo) => campo.toLowerCase().includes(texto))
    })
  }, [usuarios, busqueda, filtroRol, soloPendientes, usuario.id])

  return (
    <div className="app-layout">
      <NavApp />
      <main className="app-main app-main--ancho">
        <header className="app-cabecera">
          <h1>Panel de administración</h1>
          <p>Control total sobre usuarios, textos y matches.</p>
        </header>

        {error && <div className="aviso aviso--error">{error}</div>}

        <div className="stats">
          <Stat etiqueta="Clientes" valor={stats.clientes} />
          <Stat etiqueta="Servicios" valor={stats.servicios} />
          <Stat etiqueta="Matches" valor={stats.matches} />
          <Stat etiqueta="Likes" valor={stats.likes} />
          <Stat etiqueta="Bloqueados" valor={stats.bloqueados} />
          <Stat etiqueta="Textos por revisar" valor={stats.resumenes_pendientes} destacado />
        </div>

        <div className="filtros">
          <input
            type="search"
            placeholder="Buscar por nombre, email, ciudad, teléfono…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <select value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)}>
            <option value="">Todos los roles</option>
            <option value="cliente">Clientes</option>
            <option value="servicio">Servicios</option>
            <option value="admin">Administradores</option>
          </select>
          <label className="campo-interruptor">
            <input
              type="checkbox"
              checked={soloPendientes}
              onChange={(e) => setSoloPendientes(e.target.checked)}
            />
            Solo textos por revisar
          </label>
          <button onClick={cargar}>Recargar</button>
        </div>

        {cargando ? (
          <p className="mazo-vacio">Cargando…</p>
        ) : (
          <div className="tabla-scroll">
            <table className="tabla-admin">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Contacto</th>
                  <th>Servicio</th>
                  <th>Resumen</th>
                  <th>Matches</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((u) => (
                  <tr key={u.id} className={u.bloqueado ? 'fila-bloqueada' : ''}>
                    <td>
                      <div className="celda-usuario">
                        {u.foto_url
                          ? <img src={u.foto_url} alt="" />
                          : <span className="sin-foto">—</span>}
                        <div>
                          <strong>{u.nombre || '(sin nombre)'}</strong>
                          <small>{u.ciudad}</small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <select
                        value={u.rol}
                        disabled={u.id === usuario.id}
                        onChange={(e) => actualizar(u.id, { rol: e.target.value })}
                      >
                        {Object.entries(ETIQUETA_ROL).map(([v, t]) => (
                          <option key={v} value={v}>{t}</option>
                        ))}
                      </select>
                    </td>

                    <td className="celda-contacto">
                      <span>{u.email}</span>
                      <small>{u.telefono}</small>
                    </td>

                    <td>
                      {u.categoria}
                      <small>{Number(u.precio_hora).toFixed(0)} €/h</small>
                    </td>

                    <td className="celda-resumen">
                      {u.resumen ? (
                        <>
                          <p>{u.resumen}</p>
                          <span className={`pastilla pastilla--${u.resumen_estado}`}>
                            {u.resumen_estado}
                          </span>
                          <div className="botones-moderacion">
                            <button
                              className="btn-ok"
                              onClick={() => actualizar(u.id, { resumen_estado: 'aprobado' })}
                            >
                              Aprobar
                            </button>
                            <button
                              className="btn-no"
                              onClick={() => actualizar(u.id, { resumen_estado: 'rechazado' })}
                            >
                              Rechazar
                            </button>
                          </div>
                        </>
                      ) : (
                        <span className="tenue">sin texto</span>
                      )}
                    </td>

                    <td className="celda-centro">{u.total_matches}</td>

                    <td className="celda-acciones">
                      <button onClick={() => actualizar(u.id, { bloqueado: !u.bloqueado })}>
                        {u.bloqueado ? 'Desbloquear' : 'Bloquear'}
                      </button>
                      <button onClick={() => actualizar(u.id, { visible: !u.visible })}>
                        {u.visible ? 'Ocultar' : 'Mostrar'}
                      </button>
                      <button
                        className="btn-peligro"
                        disabled={u.id === usuario.id}
                        onClick={() => borrar(u)}
                      >
                        Borrar
                      </button>
                    </td>
                  </tr>
                ))}

                {visibles.length === 0 && (
                  <tr>
                    <td colSpan={7} className="celda-centro tenue">
                      Ningún usuario coincide con el filtro.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}

function Stat({ etiqueta, valor, destacado = false }) {
  return (
    <div className={`stat ${destacado && valor > 0 ? 'stat--alerta' : ''}`}>
      <span className="stat-valor">{valor ?? 0}</span>
      <span className="stat-etiqueta">{etiqueta}</span>
    </div>
  )
}
