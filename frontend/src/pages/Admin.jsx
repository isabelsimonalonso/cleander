import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase, borrarFotosDe } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { unidadCorta, traducirDato } from '../lib/constantes'
import { useIdioma } from '../lib/i18n'
import { mensajeError } from '../lib/errores'
import NavApp from '../components/NavApp'
import FichaUsuario from '../components/FichaUsuario'
import '../styles/app.css'
import '../styles/admin.css'



// El rol admin NO se concede desde aquí: solo se puede corregir si alguien
// se registró con el lado equivocado. Para nombrar a otro administrador hay
// que entrar en Supabase y hacerlo por SQL, a propósito.
const ROLES_ASIGNABLES = ['cliente', 'servicio']

/**
 * Las cuentas que creamos nosotros para que la web no saliera vacía.
 *
 * Las 106 de la semilla se reconocen por su dominio. Las dos de prueba no
 * pueden: viven en @cleander.app para poder entrar escribiendo solo
 * «democliente», y ahí vive también la cuenta de administración. Por eso
 * van escritas enteras, igual que en 27_usuario_demo.sql.
 */
const DOMINIO_DE_MUESTRA = '@semilla.cleander.app'
const CORREOS_DE_PRUEBA = ['democliente@cleander.app', 'demoservicio@cleander.app']

function esDeMuestra(u) {
  const correo = (u.email || '').toLowerCase()
  return correo.endsWith(DOMINIO_DE_MUESTRA) || CORREOS_DE_PRUEBA.includes(correo)
}

/** Los estados llegan en español desde la base de datos. */
const CLAVE_ESTADO = {
  pendiente: 'estadoPendiente',
  aprobada: 'estadoAprobado',
  aprobado: 'estadoAprobado',
  rechazada: 'estadoRechazado',
  rechazado: 'estadoRechazado',
}

const CLAVE_ESTADO_DENUNCIA = {
  pendiente: 'enRevision',
  revisada: 'revisadaConMedidas',
  descartada: 'revisadaSinMedidas',
}

export default function Admin() {
  const { usuario } = useAuth()
  const { t, idioma } = useIdioma()
  const [usuarios, setUsuarios] = useState([])
  const [stats, setStats] = useState({})
  const [busqueda, setBusqueda] = useState('')
  const [filtroRol, setFiltroRol] = useState('')
  const [soloPendientes, setSoloPendientes] = useState(false)
  const [ocultarMuestra, setOcultarMuestra] = useState(false)
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
    if (errorLista) setError(mensajeError(errorLista, t))
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
      setError(mensajeError(errorUpd, t))
      return
    }
    setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, ...cambios } : u)))
    supabase.rpc('admin_estadisticas').then(({ data }) => setStats(data ?? {}))
  }

  const resolverDenuncia = async (id, estado) => {
    const { error: errorD } = await supabase
      .from('denuncias').update({ estado }).eq('id', id)
    if (errorD) { setError(mensajeError(errorD, t)); return }
    setDenuncias((prev) => prev.map((d) => (d.id === id ? { ...d, estado } : d)))
    supabase.rpc('admin_estadisticas').then(({ data }) => setStats(data ?? {}))
  }

  /** Bloquear pidiendo el motivo, que la persona leerá al intentar entrar. */
  const bloquear = async (u, motivoSugerido = '') => {
    const motivo = prompt(
      t('preguntaMotivoBloqueo', { nombre: u.nombre }),
      motivoSugerido
    )
    if (motivo === null) return   // ha cancelado
    await actualizar(u.id, { bloqueado: true, motivo_bloqueo: motivo.trim() })
  }

  const borrar = async (u) => {
    if (!confirm(t('confirmarBorrado', { nombre: u.nombre || u.email }))) {
      return
    }
    // La foto va aparte: no se puede borrar desde la base de datos
    await borrarFotosDe(u.id)

    const { error: errorDel } = await supabase.rpc('admin_borrar_usuario', { objetivo: u.id })
    if (errorDel) {
      setError(mensajeError(errorDel, t))
      return
    }
    setUsuarios((prev) => prev.filter((x) => x.id !== u.id))
    cargar()
  }

  // Las cuentas inventadas de 26_semilla.sql y 27_usuario_demo.sql. Se
  // reconocen por el dominio del correo, que es también por donde las
  // borra su propio script. Mientras estén, el panel las lista como a
  // cualquiera; esta casilla las aparta para ver solo gente de verdad.
  const deMuestra = useMemo(
    () => usuarios.filter((u) => u.id !== usuario.id && esDeMuestra(u)).length,
    [usuarios, usuario.id]
  )

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
      if (ocultarMuestra && esDeMuestra(u)) return false
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
  }, [usuarios, busqueda, filtroRol, soloPendientes, ocultarMuestra, usuario.id])

  // `admin_estadisticas()` cuenta en la base de datos y no sabe de cuentas
  // de muestra. Con la casilla marcada, estos dos se recuentan aquí.
  const reales = useMemo(() => ({
    cliente:  usuarios.filter((u) => u.rol === 'cliente'  && !esDeMuestra(u)).length,
    servicio: usuarios.filter((u) => u.rol === 'servicio' && !esDeMuestra(u)).length,
  }), [usuarios])

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
          <h1>{t('panelTitulo')}</h1>
          <p>{t('panelSubtitulo')}</p>
        </header>

        {error && <div className="aviso aviso--error">{error}</div>}

        <div className="stats">
          <Stat etiqueta={t('statClientes')} valor={ocultarMuestra ? reales.cliente : stats.clientes} />
          <Stat etiqueta={t('statServicios')} valor={ocultarMuestra ? reales.servicio : stats.servicios} />
          <Stat etiqueta={t('statMatches')} valor={stats.matches} />
          <Stat etiqueta={t('statLikes')} valor={stats.likes} />
          <Stat etiqueta={t('statBloqueados')} valor={stats.bloqueados} />
          <Stat etiqueta={t('statTextos')} valor={stats.resumenes_pendientes} destacado />
          <Stat etiqueta={t('statFotos')} valor={stats.fotos_pendientes} destacado />
          <Stat etiqueta={t('statDenuncias')} valor={stats.denuncias_pendientes} destacado />
        </div>

        <div className="pestanas-admin">
          <button
            className={vista === 'usuarios' ? 'activa' : ''}
            onClick={() => setVista('usuarios')}
          >
            {t('pestanaUsuarios')}
          </button>
          <button
            className={vista === 'denuncias' ? 'activa' : ''}
            onClick={() => setVista('denuncias')}
          >
            {t('pestanaDenuncias')}
            {stats.denuncias_pendientes > 0 && (
              <span className="contador-filtro">{stats.denuncias_pendientes}</span>
            )}
          </button>
        </div>

        {vista === 'denuncias' && (
          <div className="lista-denuncias">
            {denuncias.length === 0 && (
              <p className="bloque-vacio">{t('sinDenuncias')}</p>
            )}
            {denuncias.map((d) => (
              <div className={`denuncia denuncia--${d.estado}`} key={d.id}>
                <div className="denuncia-cabecera">
                  <strong>{traducirDato(d.motivo, idioma)}</strong>
                  <span className={`pastilla pastilla--${d.estado === 'pendiente' ? 'pendiente' : d.estado === 'revisada' ? 'aprobada' : 'rechazada'}`}>
                    {t(CLAVE_ESTADO_DENUNCIA[d.estado] ?? 'enRevision')}
                  </span>
                </div>
                <p className="denuncia-contra">
                  {t('contra')} <strong>{d.denunciado_nombre}</strong> ({d.denunciado_email})
                  {d.denunciado_bloqueado && <span className="pastilla pastilla--rechazada">{t('bloqueadoEtiqueta')}</span>}
                </p>
                {d.detalle && <p className="denuncia-detalle">«{d.detalle}»</p>}
                <small>
                  {t('de')} {d.denunciante_nombre} · {new Date(d.creado_en).toLocaleString('es-ES')}
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
                      {t('bloquearYCerrar')}
                    </button>
                  )}
                  {d.estado === 'pendiente' && (
                    <>
                      <button onClick={() => resolverDenuncia(d.id, 'revisada')}>
                        {t('marcarRevisada')}
                      </button>
                      <button onClick={() => resolverDenuncia(d.id, 'descartada')}>
                        {t('descartar')}
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
            placeholder={t('buscarUsuario')}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <select value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)}>
            <option value="">{t('todosLosRoles')}</option>
            <option value="cliente">{t('statClientes')}</option>
            <option value="servicio">{t('statServicios')}</option>
          </select>
          <label className={`campo-interruptor ${pendientes + fotosPendientes === 0 ? 'campo-interruptor--vacio' : ''}`}>
            <input
              type="checkbox"
              checked={soloPendientes}
              disabled={pendientes + fotosPendientes === 0}
              onChange={(e) => setSoloPendientes(e.target.checked)}
            />
            {t('soloPendientes')}
            <span className="contador-filtro">{pendientes + fotosPendientes}</span>
          </label>
          <label className={`campo-interruptor ${deMuestra === 0 ? 'campo-interruptor--vacio' : ''}`}>
            <input
              type="checkbox"
              checked={ocultarMuestra}
              disabled={deMuestra === 0}
              onChange={(e) => setOcultarMuestra(e.target.checked)}
            />
            {t('ocultarMuestra')}
            <span className="contador-filtro">{deMuestra}</span>
          </label>
          <button onClick={cargar}>{t('recargar')}</button>
        </div>

        )}

        {vista === 'usuarios' && (cargando ? (
          <p className="mazo-vacio">{t('cargando')}</p>
        ) : (
          <div className="tabla-scroll">
            <table className="tabla-admin">
              <thead>
                <tr>
                  <th>{t('colUsuario')}</th>
                  <th>{t('colFoto')}</th>
                  <th>{t('colRol')}</th>
                  <th>{t('colContacto')}</th>
                  <th>{t('colServicio')}</th>
                  <th>{t('colResumen')}</th>
                  <th>{t('colMatches')}</th>
                  <th>{t('colAcciones')}</th>
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
                            {t(CLAVE_ESTADO[u.foto_estado] ?? 'estadoPendiente')}
                          </span>
                          <div className="botones-moderacion">
                            {u.foto_estado !== 'aprobada' && (
                              <button
                                className="btn-ok"
                                onClick={() => actualizar(u.id, { foto_estado: 'aprobada' })}
                              >
                                {t('aprobar')}
                              </button>
                            )}
                            {u.foto_estado !== 'rechazada' && (
                              <button
                                className="btn-no"
                                onClick={() => actualizar(u.id, { foto_estado: 'rechazada' })}
                              >
                                {t('rechazar')}
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
                        <span className="pastilla pastilla--admin">{t('rolAdmin')}</span>
                      ) : (
                        <select
                          value={u.rol}
                          onChange={(e) => actualizar(u.id, { rol: e.target.value })}
                        >
                          {ROLES_ASIGNABLES.map((v) => (
                            <option key={v} value={v}>
                              {t(v === 'cliente' ? 'statClientes' : 'statServicios')}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>

                    <td className="celda-contacto">
                      <span>{u.email}</span>
                      <small>{u.telefono}</small>
                    </td>

                    <td>
                      {traducirDato(u.categoria, idioma)}
                      <small>{Number(u.precio_hora).toFixed(0)} €{unidadCorta(u.unidad_precio)}</small>
                    </td>

                    <td className="celda-resumen">
                      {u.resumen ? (
                        <>
                          <p>{u.resumen}</p>
                          <span className={`pastilla pastilla--${u.resumen_estado}`}>
                            {t(CLAVE_ESTADO[u.resumen_estado] ?? 'estadoPendiente')}
                          </span>
                          <div className="botones-moderacion">
                            {u.resumen_estado !== 'aprobado' && (
                              <button
                                className="btn-ok"
                                onClick={() => actualizar(u.id, { resumen_estado: 'aprobado' })}
                              >
                                {t('aprobar')}
                              </button>
                            )}
                            {u.resumen_estado !== 'rechazado' && (
                              <button
                                className="btn-no"
                                onClick={() => actualizar(u.id, { resumen_estado: 'rechazado' })}
                              >
                                {t('rechazar')}
                              </button>
                            )}
                          </div>
                        </>
                      ) : (
                        <span className="tenue">{t('sinTexto')}</span>
                      )}
                    </td>

                    <td className="celda-centro">{u.total_matches}</td>

                    <td className="celda-acciones">
                      <button className="btn-ver" onClick={() => setFicha(u)}>
                        {t('verPerfil')}
                      </button>
                      <button
                        onClick={() =>
                          u.bloqueado
                            ? actualizar(u.id, { bloqueado: false, motivo_bloqueo: '' })
                            : bloquear(u)
                        }
                      >
                        {t(u.bloqueado ? 'desbloquear' : 'bloquear')}
                      </button>
                      <button onClick={() => actualizar(u.id, { visible: !u.visible })}>
                        {t(u.visible ? 'ocultar' : 'mostrar')}
                      </button>
                      <button
                        className="btn-peligro"
                        disabled={u.id === usuario.id}
                        onClick={() => borrar(u)}
                      >
                        {t('borrar')}
                      </button>
                    </td>
                  </tr>
                ))}

                {enPantalla.length === 0 && (
                  <tr>
                    <td colSpan={8} className="celda-centro tenue">
                      {t('nadieCoincide')}
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
              {t('anterior')}
            </button>
            <span>
              {t('paginaDe', { actual: paginaActual + 1, total: totalPaginas, n: visibles.length })}
            </span>
            <button
              disabled={paginaActual >= totalPaginas - 1}
              onClick={() => setPagina(paginaActual + 1)}
            >
              {t('siguiente')}
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
