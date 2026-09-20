import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, subirFoto, borrarFotosDe } from '../lib/supabase'
import { LIMITE_RESUMEN, telefonoValido, unidadPrecio } from '../lib/constantes'
import { mensajeError } from '../lib/errores'
import { useAuth } from '../context/AuthContext'
import NavApp from '../components/NavApp'
import CambiarClave from '../components/CambiarClave'
import Tarjeta from '../components/Tarjeta'
import SelectorUbicacion from '../components/SelectorUbicacion'
import SelectorServicio from '../components/SelectorServicio'
import SubirFoto from '../components/SubirFoto'
import { useIdioma } from '../lib/i18n'
import { IconoDescarga, IconoPapelera, IconoArchivar } from '../components/Iconos'
import '../styles/app.css'

const ESTADO_FOTO = {
  pendiente: { clave: 'fotoPendiente', clase: 'pendiente' },
  aprobada: { clave: 'fotoAprobada', clase: 'aprobado' },
  rechazada: { clave: 'fotoRechazada', clase: 'rechazado' },
}

const ESTADO_RESUMEN = {
  pendiente: { clave: 'textoPendiente', clase: 'pendiente' },
  aprobado: { clave: 'textoAprobado', clase: 'aprobado' },
  rechazado: { clave: 'textoRechazado', clase: 'rechazado' },
}

export default function MiPerfil() {
  const { usuario, perfil, refrescarPerfil, logout, marcarDenunciasVistas } = useAuth()
  const navigate = useNavigate()
  const { t, idioma } = useIdioma()
  const [form, setForm] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [valoracion, setValoracion] = useState({ media: 0, total: 0 })
  const [confirmacion, setConfirmacion] = useState('')
  const [borrando, setBorrando] = useState(false)
  const [verBorrado, setVerBorrado] = useState(false)
  const [misDenuncias, setMisDenuncias] = useState([])
  const [verClave, setVerClave] = useState(false)

  useEffect(() => {
    if (perfil) setForm(perfil)
  }, [perfil])

  // Con solo abrir esta pantalla, el aviso verde se apaga
  useEffect(() => {
    marcarDenunciasVistas(usuario?.id)
  }, [marcarDenunciasVistas, usuario?.id])

  // Sus denuncias, para que sepa en qué han quedado
  useEffect(() => {
    if (!usuario?.id) return
    let activo = true
    supabase
      .rpc('mis_denuncias')
      .then(({ data }) => { if (activo) setMisDenuncias(data ?? []) })
    return () => { activo = false }
  }, [usuario?.id])

  // Las estrellas que te han puesto, para que tu vista previa enseñe lo
  // mismo que ven los demás en tu tarjeta.
  useEffect(() => {
    if (!usuario?.id) return
    let activo = true
    supabase
      .from('valoraciones')
      .select('estrellas')
      .eq('destinatario', usuario.id)
      .then(({ data }) => {
        if (!activo || !data?.length) return
        const suma = data.reduce((t, v) => t + v.estrellas, 0)
        setValoracion({ media: suma / data.length, total: data.length })
      })
    return () => { activo = false }
  }, [usuario?.id])

  if (!form) return <div className="pantalla-carga">{t('cargando')}</div>

  const cambiar = (campo) => (e) =>
    setForm((prev) => ({ ...prev, [campo]: e.target.value }))

  const cambiarFoto = async (archivo) => {
    setGuardando(true)
    try {
      const url = await subirFoto(archivo, usuario.id)
      await supabase.from('perfiles').update({ foto_url: url }).eq('id', usuario.id)
      setForm((prev) => ({ ...prev, foto_url: url }))
      await refrescarPerfil()
      setMensaje(t('fotoActualizada'))
    } catch (err) {
      setError(mensajeError(err, t))
    } finally {
      setGuardando(false)
    }
  }

  /** Quitar de la lista una denuncia ya resuelta. */
  const archivarDenuncia = async (id) => {
    const { error: errorArchivo } = await supabase.rpc('archivar_denuncia', {
      denuncia_id: id,
    })
    if (errorArchivo) {
      setError(mensajeError(errorArchivo, t))
      return
    }
    setMisDenuncias((prev) => prev.filter((d) => d.id !== id))
  }

  /** Derecho de portabilidad: todo lo tuyo en un archivo. */
  const descargarDatos = async () => {
    setError('')
    const [perfilPropio, misMatches, misVotos, votosRecibidos, misIntereses] =
      await Promise.all([
        supabase.from('perfiles').select('*').eq('id', usuario.id).maybeSingle(),
        supabase.rpc('mis_matches'),
        supabase.from('valoraciones').select('destinatario,estrellas,creado_en').eq('autor', usuario.id),
        supabase.from('valoraciones').select('autor,estrellas,creado_en').eq('destinatario', usuario.id),
        supabase.from('intereses').select('receptor,decision,creado_en').eq('emisor', usuario.id),
      ])

    const datos = {
      exportado_en: new Date().toISOString(),
      cuenta: { id: usuario.id, email: usuario.email },
      perfil: perfilPropio.data,
      matches: misMatches.data,
      valoraciones_que_he_dado: misVotos.data,
      valoraciones_que_he_recibido: votosRecibidos.data,
      decisiones: misIntereses.data,
    }

    const enlace = document.createElement('a')
    enlace.href = URL.createObjectURL(
      new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' })
    )
    enlace.download = `cleanderapp-mis-datos-${new Date().toISOString().slice(0, 10)}.json`
    enlace.click()
    URL.revokeObjectURL(enlace.href)
    setMensaje(t('descargaLista'))
  }

  const borrarCuenta = async () => {
    setError('')
    setBorrando(true)

    // Primero la foto: después del borrado ya no habría sesión con la
    // que pedirle a Storage que la quite.
    await borrarFotosDe(usuario.id)

    const { error: errorBorrado } = await supabase.rpc('borrar_mi_cuenta')

    if (errorBorrado) {
      setBorrando(false)
      setError(mensajeError(errorBorrado, t))
      return
    }

    await logout()
    navigate('/login')
  }

  const guardar = async (e) => {
    e.preventDefault()
    setError('')
    setMensaje('')

    if (!form.provincia || !form.ciudad) {
      setError(t('errUbicacion'))
      return
    }
    if (!telefonoValido(form.telefono)) {
      setError(t('errTelefono'))
      return
    }
    setGuardando(true)

    const { error: errorGuardar } = await supabase
      .from('perfiles')
      .update({
        nombre: form.nombre.trim(),
        telefono: form.telefono.trim(),
        provincia: form.provincia,
        ciudad: form.ciudad,
        categoria: form.categoria,
        precio_hora: Number(form.precio_hora) || 0,
        unidad_precio: form.unidad_precio ?? 'hora',
        resumen: (form.resumen ?? '').trim(),
        visible: form.visible,
      })
      .eq('id', usuario.id)

    setGuardando(false)
    if (errorGuardar) {
      setError(mensajeError(errorGuardar, t))
      return
    }
    await refrescarPerfil()
    setMensaje(t('cambiosGuardados'))
  }

  const estado = ESTADO_RESUMEN[form.resumen_estado] ?? ESTADO_RESUMEN.pendiente

  return (
    <div className="app-layout">
      <NavApp />
      <main className="app-main app-main--perfil">
        <header className="app-cabecera">
          <h1>{t('miPerfil')}</h1>
          <p>{t('subtituloPerfil')}</p>
        </header>

        {error && <div className="aviso aviso--error">{error}</div>}
        {mensaje && <div className="aviso aviso--ok">{mensaje}</div>}

        <div className="perfil-columnas">
          <section className="perfil-vista-previa">
            <Tarjeta
              propio
              perfil={{
                ...form,
                resumen: form.resumen_estado === 'aprobado' ? form.resumen : '',
                foto_url: form.foto_estado === 'aprobada' ? form.foto_url : null,
                valoracion_media: valoracion.media,
                total_valoraciones: valoracion.total,
              }}
            />
          </section>

          <form className="perfil-formulario" onSubmit={guardar}>
            <SubirFoto
              vistaPrevia={form.foto_url}
              estado={form.foto_url ? {
                ...(ESTADO_FOTO[form.foto_estado] ?? ESTADO_FOTO.pendiente),
                texto: t((ESTADO_FOTO[form.foto_estado] ?? ESTADO_FOTO.pendiente).clave),
              } : null}
              onArchivo={cambiarFoto}
              onError={setError}
            />

            <label className="campo-etiqueta">{t('nombre')}</label>
            <input type="text" value={form.nombre} onChange={cambiar('nombre')} maxLength={80} required />

            <label className="campo-etiqueta">{t('whatsapp')}</label>
            <input type="tel" value={form.telefono} onChange={cambiar('telefono')} maxLength={20} required />

            <SelectorUbicacion
              provincia={form.provincia}
              municipio={form.ciudad}
              onChange={(u) => setForm((prev) => ({ ...prev, ...u }))}
            />

            <label className="campo-etiqueta">{t(form.rol === 'servicio' ? 'categoriaServicio' : 'categoriaCliente')}</label>
            <SelectorServicio value={form.categoria} onChange={cambiar('categoria')} />

            <label className="campo-etiqueta">
              {t(form.rol === 'servicio' ? 'precioServicio' : 'precioCliente', { unidad: unidadPrecio(form.unidad_precio) })} (€)
            </label>
            <div className="precio-con-unidad">
              <input
                type="number" min="0" max="1000" step="0.5"
                value={form.precio_hora}
                onChange={cambiar('precio_hora')}
                required
              />
              <select value={form.unidad_precio ?? 'hora'} onChange={cambiar('unidad_precio')}>
                <option value="hora">{t('porHora')}</option>
                <option value="dia">{t('porDia')}</option>
              </select>
            </div>

            <label className="campo-etiqueta">{t('resumen')}</label>
            <textarea
              value={form.resumen ?? ''}
              onChange={cambiar('resumen')}
              maxLength={LIMITE_RESUMEN}
              rows={3}
              placeholder={t(form.rol === 'servicio' ? 'resumenServicio' : 'resumenCliente', { max: LIMITE_RESUMEN })}
            />
            <span className={`estado-resumen estado-resumen--${estado.clase}`}>
              {(form.resumen ?? '').length}/{LIMITE_RESUMEN} · {t(estado.clave)}
            </span>

            <label className="campo-interruptor">
              <input
                type="checkbox"
                checked={form.visible}
                onChange={(e) => setForm((p) => ({ ...p, visible: e.target.checked }))}
              />
              {t('aparecerEnBusquedas')}
            </label>

            <button type="submit" disabled={guardando}>
              {guardando ? t('guardando') : t('guardar')}
            </button>
          </form>

        <div className="perfil-extra">
        {misDenuncias.length > 0 && (
          <section className="zona-denuncias">
            <h2>{t('denunciasEnviadas')}</h2>
            <ul>
              {misDenuncias.map((d, i) => (
                <li key={i}>
                  <span className="denuncia-contra-quien">
                    <strong>{d.contra}</strong>
                    {d.motivo}
                  </span>
                  <span className={`pastilla-estado pastilla-estado--${d.estado}`}>
                    {t(d.estado === 'pendiente' ? 'enRevision'
                      : d.estado === 'revisada' ? 'revisadaConMedidas'
                      : 'revisadaSinMedidas')}
                  </span>
                  <small>{new Date(d.creado_en).toLocaleDateString(idioma === 'en' ? 'en-GB' : 'es-ES')}</small>
                  {d.estado !== 'pendiente' && (
                    <button
                      className="boton-archivar"
                      title={t('quitarDeLista')}
                      aria-label={t('quitarDeLista')}
                      onClick={() => archivarDenuncia(d.id)}
                    >
                      <IconoArchivar />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {!verBorrado && (
          <section className="zona-clave">
            <h2>{t('contrasena')}</h2>
            {verClave ? (
              <>
                <CambiarClave onHecho={() => {
                  setVerClave(false)
                  setMensaje(t('contrasenaCambiada'))
                }} />
                <button type="button" className="boton-retirar" onClick={() => setVerClave(false)}>
                  {t('cancelar')}
                </button>
              </>
            ) : (
              <button type="button" className="boton-retirar" onClick={() => setVerClave(true)}>
                {t('cambiarContrasena')}
              </button>
            )}
          </section>
        )}

        {!verBorrado && (
          <div className="acciones-cuenta">
            <button
              type="button"
              className="accion-cuenta"
              onClick={descargarDatos}
              title={t('descargarDatos')}
            >
              <IconoDescarga />
              <span>{t('misDatos')}</span>
            </button>
            <button
              type="button"
              className="accion-cuenta accion-cuenta--peligro"
              onClick={() => setVerBorrado(true)}
              title={t('eliminarCuentaAviso')}
            >
              <IconoPapelera />
              <span>{t('eliminarCuenta')}</span>
            </button>
          </div>
        )}

        <section className="zona-peligro">
          {!verBorrado ? null : (
          <>
            <h2>{t('eliminarCuentaTitulo')}</h2>
            <p>
              {t('eliminarCuentaTexto')} <strong>{t('noSePuedeDeshacer')}</strong>
            </p>
            <label className="campo-etiqueta" htmlFor="confirmar-borrado">
              {t('escribeBorrar', { palabra: '' })} <code>{t('palabraBorrar')}</code>
            </label>
            <input
              id="confirmar-borrado"
              type="text"
              value={confirmacion}
              onChange={(e) => setConfirmacion(e.target.value)}
              placeholder={t('palabraBorrar')}
              autoComplete="off"
            />
            <button
              type="button"
              className="boton-peligro"
              disabled={confirmacion.trim().toUpperCase() !== t('palabraBorrar') || borrando}
              onClick={borrarCuenta}
            >
              {borrando ? t('eliminando') : t('eliminarDefinitivamente')}
            </button>
            <button
              type="button"
              className="boton-retirar"
              onClick={() => { setVerBorrado(false); setConfirmacion('') }}
            >
              {t('cancelar')}
            </button>
          </>
          )}
        </section>
        </div>
        </div>
      </main>
    </div>
  )
}
