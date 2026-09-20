import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase, borrarFotosDe } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { unidadCorta } from '../lib/constantes'
import NavApp from '../components/NavApp'
import FichaUsuario from '../components/FichaUsuario'
import '../styles/app.css'
import '../styles/admin.css'

const ETIQUETA_ROL = { admin: 'Admin', cliente: 'Cliente', servicio: 'Servicio' }

// El rol admin NO se concede desde aquí: solo se puede corregir si alguien
// se registró con el lado equivocado. Para nombrar a otro administrador hay
// que entrar en Supabase y hacerlo por SQL, a propósito.
const ROLES_ASIGNABLES = ['cliente', 'servicio']

export default function Admin() {
  const { usuario } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [stats, setStats] = useState({})
  const [busqueda, setBusqueda] = useState('')
  const [filtroRol, setFiltroRol] = useState('')
  const [soloPendientes, setSoloPendientes] = useState(false)
  const [denuncias, setDenuncias] = useState([])
  const [vista, setVista] = useState('usuarios')   // usuarios | denuncias
  const [pagina, setPagina] = useState(0)
  const [ficha, setFicha] = useState(null)   // usuario abierto en detalle
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const cargar = useCallback(async () => {
    setCargando(true)
    const [{ data: lista, error: errorLista }, { data: numeros }, { data: denus }] =
      await Promise.all([
        supabase.rpc('admin_usuarios'),
        supabase.rpc('admin_estadisticas'),
        supabase.rpc('admin_denuncias'),
      ])
    if (errorLista) setError(errorLista.message)
    setUsuarios(lista ?? [])
    setStats(numeros ?? {})
    setDenuncias(denus ?? [])
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

  const resolverDenuncia = async (id, estado) => {
    const { error: errorD } = await supabase
      .from('denuncias').update({ estado }).eq('id', id)
    if (errorD) { setError(errorD.message); return }
    setDenuncias((prev) => prev.map((d) => (d.id === id ? { ...d, estado } : d)))
    supabase.rpc('admin_estadisticas').then(({ data }) => setStats(data ?? {}))
  }

  /** Bloquear pidiendo el motivo, que la persona leerá al intentar entrar. */
  const bloquear = async (u, motivoSugerido = '') => {
    const motivo = prompt(
      `¿Por qué bloqueas a ${u.nombre}?\n\n` +
      'Lo leerá en la pantalla de cuenta suspendida. Déjalo vacío si prefieres no decirlo.',
      motivoSugerido
    )
    if (motivo === null) return   // ha cancelado
    await actualizar(u.id, { bloqueado: true, motivo_bloqueo: motivo.trim() })
  }

  const borrar = async (u) => {
    if (!confirm(`Borrar definitivamente a ${u.nombre || u.email}?\n\nSe eliminarán su perfil, sus matches y sus valoraciones. No se puede deshacer.`)) {
      return
    }
    // La foto va aparte: no se puede borrar desde la base de datos
    await borrarFotosDe(u.id)

    const { error: errorDel } = await supabase.rpc('admin_borrar_usuario', { objetivo: u.id })
    if (errorDel) {
      setError(errorDel.message)
      return
    }
    setUsuarios((prev) => prev.filter((x) => x.id !== u.id))
    cargar()
  }

  // Cuántos textos esperan revisión, contando solo las filas que se listan.
  // Va en la etiqueta de la casilla para que se vea qué hará al marcarla.
  const fotosPendientes = useMemo(
    () => usuarios.filter(
      (u) => u.id !== usuario.id && u.foto_url && u.foto_estado === 'pendiente'
    ).length,
    [usuarios, usuario.id]
  )

  const pendientes = useMemo(
    () => usuarios.filter(
      (u) => u.id !== usuario.id && u.resumen && u.resumen_estado === 'pendiente'
    ).length,
    [usuarios, usuario.id]
  )

  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return usuarios.filter((u) => {
      // Tu propia fila no pinta nada aquí: no puedes moderarte ni borrarte.
      if (u.id === usuario.id) return false
      if (filtroRol && u.rol !== filtroRol) return false
      if (soloPendientes) {
        const textoPend = u.resumen && u.resumen_estado === 'pendiente'
        const fotoPend = u.foto_url && u.foto_estado === 'pendiente'
        if (!textoPend && !fotoPend) return false
      }
      if (!texto) return true
      return [u.nombre, u.email, u.ciudad, u.provincia, u.categoria, u.telefono]
        .filter(Boolean)
        .some((campo) => campo.toLowerCase().includes(texto))
    })
  }, [usuarios, busqueda, filtroRol, soloPendientes, usuario.id])

  const nombrePorId = useMemo(
    () => Object.fromEntries(usuarios.map((u) => [u.id, u.nombre])),
    [usuarios]
  )

  const POR_PAGINA = 25
  const totalPaginas = Math.max(1, Math.ceil(visibles.length / POR_PAGINA))
  const paginaActual = Math.min(pagina, totalPaginas - 1)
  const enPantalla = visibles.slice(
    paginaActual * POR_PAGINA,
    paginaActual * POR_PAGINA + POR_PAGINA
  )

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
          <Stat etiqueta="Fotos por revisar" valor={stats.fotos_pendientes} destacado />
          <Stat etiqueta="Denuncias" valor={stats.denuncias_pendientes} destacado />
        </div>

        <div className="pestanas-admin">
          <button
            className={vista === 'usuarios' ? 'activa' : ''}
            onClick={() => setVista('usuarios')}
          >
            Usuarios
          </button>
          <button
            className={vista === 'denuncias' ? 'activa' : ''}
            onClick={() => setVista('denuncias')}
          >
            Denuncias
            {stats.denuncias_pendientes > 0 && (
              <span className="contador-filtro">{stats.denuncias_pendientes}</span>
            )}
          </button>
        </div>

        {vista === 'denuncias' && (
          <div className="lista-denuncias">
            {denuncias.length === 0 && (
              <p className="bloque-vacio">No hay ninguna denuncia.</p>
            )}
            {denuncias.map((d) => (
              <div className={`denuncia denuncia--${d.estado}`} key={d.id}>
                <div className="denuncia-cabecera">
                  <strong>{d.motivo}</strong>
                  <span className={`pastilla pastilla--${d.estado === 'pendiente' ? 'pendiente' : d.estado === 'revisada' ? 'aprobada' : 'rechazada'}`}>
                    {d.estado}
                  </span>
                </div>
                <p className="denuncia-contra">
                  Contra <strong>{d.denunciado_nombre}</strong> ({d.denunciado_email})
                  {d.denunciado_bloqueado && <span className="pastilla pastilla--rechazada">bloqueado</span>}
                </p>
                {d.detalle && <p className="denuncia-detalle">«{d.detalle}»</p>}
                <small>
                  De {d.denunciante_nombre} · {new Date(d.creado_en).toLocaleString('es-ES')}
                </small>
                <div className="botones-moderacion">
                  {!d.denunciado_bloqueado && (
                    <button
                      className="btn-no"
                      onClick={async () => {
                        await bloquear(
                          { id: d.denunciado_id, nombre: d.denunciado_nombre },
                          d.motivo
                        )
                        resolverDenuncia(d.id, 'revisada')
                      }}
                    >
                      Bloquear y cerrar
                    </button>
                  )}
                  {d.estado === 'pendiente' && (
                    <>
                      <button onClick={() => resolverDenuncia(d.id, 'revisada')}>
                        Marcar revisada
                      </button>
                      <button onClick={() => resolverDenuncia(d.id, 'descartada')}>
                        Descartar
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {vista === 'usuarios' && (
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
          </select>
          <label className={`campo-interruptor ${pendientes + fotosPendientes === 0 ? 'campo-interruptor--vacio' : ''}`}>
            <input
              type="checkbox"
              checked={soloPendientes}
              disabled={pendientes + fotosPendientes === 0}
              onChange={(e) => setSoloPendientes(e.target.checked)}
            />
            Solo pendientes de revisar
            <span className="contador-filtro">{pendientes + fotosPendientes}</span>
          </label>
          <button onClick={cargar}>Recargar</button>
        </div>

        )}

        {vista === 'usuarios' && (cargando ? (
          <p className="mazo-vacio">Cargando…</p>
        ) : (
          <div className="tabla-scroll">
            <table className="tabla-admin">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Foto</th>
                  <th>Rol</th>
                  <th>Contacto</th>
                  <th>Servicio</th>
                  <th>Resumen</th>
                  <th>Matches</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {enPantalla.map((u) => (
                  <tr key={u.id} className={u.bloqueado ? 'fila-bloqueada' : ''}>
                    <td>
                      <div className="celda-usuario">
                        <div>
                          <strong>{u.nombre || '(sin nombre)'}</strong>
                          <small>
                            {u.ciudad}
                            {u.provincia && u.provincia !== u.ciudad ? `, ${u.provincia}` : ''}
                          </small>
                        </div>
                      </div>
                    </td>

                    <td className="celda-foto">
                      {u.foto_url ? (
                        <>
                          <a href={u.foto_url} target="_blank" rel="noopener noreferrer">
                            <img
                              className={`foto-moderar foto-moderar--${u.foto_estado}`}
                              src={u.foto_url}
                              alt={`Foto de ${u.nombre}`}
                            />
                          </a>
                          <span className={`pastilla pastilla--${u.foto_estado}`}>
                            {u.foto_estado}
                          </span>
                          <div className="botones-moderacion">
                            {u.foto_estado !== 'aprobada' && (
                              <button
                                className="btn-ok"
                                onClick={() => actualizar(u.id, { foto_estado: 'aprobada' })}
                              >
                                Aprobar
                              </button>
                            )}
                            {u.foto_estado !== 'rechazada' && (
                              <button
                                className="btn-no"
                                onClick={() => actualizar(u.id, { foto_estado: 'rechazada' })}
                              >
                                Rechazar
                              </button>
                            )}
                          </div>
                        </>
                      ) : (
                        <span className="tenue">sin foto</span>
                      )}
                    </td>

                    <td>
                      {u.rol === 'admin' ? (
                        <span className="pastilla pastilla--admin">Admin</span>
                      ) : (
                        <select
                          value={u.rol}
                          onChange={(e) => actualizar(u.id, { rol: e.target.value })}
                        >
                          {ROLES_ASIGNABLES.map((v) => (
                            <option key={v} value={v}>{ETIQUETA_ROL[v]}</option>
                          ))}
                        </select>
                      )}
                    </td>

                    <td className="celda-contacto">
                      <span>{u.email}</span>
                      <small>{u.telefono}</small>
                    </td>

                    <td>
                      {u.categoria}
                      <small>{Number(u.precio_hora).toFixed(0)} €{unidadCorta(u.categoria)}</small>
                    </td>

                    <td className="celda-resumen">
                      {u.resumen ? (
                        <>
                          <p>{u.resumen}</p>
                          <span className={`pastilla pastilla--${u.resumen_estado}`}>
                            {u.resumen_estado}
                          </span>
                          <div className="botones-moderacion">
                            {u.resumen_estado !== 'aprobado' && (
                              <button
                                className="btn-ok"
                                onClick={() => actualizar(u.id, { resumen_estado: 'aprobado' })}
                              >
                                Aprobar
                              </button>
                            )}
                            {u.resumen_estado !== 'rechazado' && (
                              <button
                                className="btn-no"
                                onClick={() => actualizar(u.id, { resumen_estado: 'rechazado' })}
                              >
                                Rechazar
                              </button>
                            )}
                          </div>
                        </>
                      ) : (
                        <span className="tenue">sin texto</span>
                      )}
                    </td>

                    <td className="celda-centro">{u.total_matches}</td>

                    <td className="celda-acciones">
                      <button className="btn-ver" onClick={() => setFicha(u)}>
                        Ver perfil
                      </button>
                      <button
                        onClick={() =>
                          u.bloqueado
                            ? actualizar(u.id, { bloqueado: false, motivo_bloqueo: '' })
                            : bloquear(u)
                        }
                      >
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

                {enPantalla.length === 0 && (
                  <tr>
                    <td colSpan={8} className="celda-centro tenue">
                      Ningún usuario coincide con el filtro.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ))}

        {vista === 'usuarios' && !cargando && totalPaginas > 1 && (
          <div className="paginador">
            <button disabled={paginaActual === 0} onClick={() => setPagina(paginaActual - 1)}>
              Anterior
            </button>
            <span>
              {paginaActual + 1} de {totalPaginas} · {visibles.length} usuarios
            </span>
            <button
              disabled={paginaActual >= totalPaginas - 1}
              onClick={() => setPagina(paginaActual + 1)}
            >
              Siguiente
            </button>
          </div>
        )}
      </main>

      {ficha && (
        <FichaUsuario
          usuario={usuarios.find((u) => u.id === ficha.id) ?? ficha}
          nombrePorId={nombrePorId}
          onCerrar={() => setFicha(null)}
          onActualizar={actualizar}
        />
      )}
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
