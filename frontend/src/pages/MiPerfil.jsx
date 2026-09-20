import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, subirFoto, borrarFotosDe } from '../lib/supabase'
import { COPY, LIMITE_RESUMEN, TAM_MAX_FOTO, unidadPrecio } from '../lib/constantes'
import { useAuth } from '../context/AuthContext'
import NavApp from '../components/NavApp'
import Tarjeta from '../components/Tarjeta'
import SelectorUbicacion from '../components/SelectorUbicacion'
import SelectorServicio from '../components/SelectorServicio'
import '../styles/app.css'

const ESTADO_FOTO = {
  pendiente: { texto: 'Pendiente de revisión — aún no se ve en tu tarjeta', clase: 'pendiente' },
  aprobada: { texto: 'Aprobada y visible', clase: 'aprobado' },
  rechazada: { texto: 'Rechazada por el equipo — sube otra', clase: 'rechazado' },
}

const ESTADO_RESUMEN = {
  pendiente: { texto: 'Pendiente de revisión — aún no se ve en tu tarjeta', clase: 'pendiente' },
  aprobado: { texto: 'Aprobado y visible', clase: 'aprobado' },
  rechazado: { texto: 'Rechazado por el equipo — edítalo y vuelve a enviarlo', clase: 'rechazado' },
}

export default function MiPerfil() {
  const { usuario, perfil, refrescarPerfil, logout } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [valoracion, setValoracion] = useState({ media: 0, total: 0 })
  const [confirmacion, setConfirmacion] = useState('')
  const [borrando, setBorrando] = useState(false)
  const [verBorrado, setVerBorrado] = useState(false)
  const [misDenuncias, setMisDenuncias] = useState([])

  useEffect(() => {
    if (perfil) setForm(perfil)
  }, [perfil])

  // Sus denuncias, para que sepa en qué han quedado
  useEffect(() => {
    if (!usuario?.id) return
    let activo = true
    supabase
      .from('denuncias')
      .select('motivo,estado,creado_en,denunciado')
      .eq('denunciante', usuario.id)
      .order('creado_en', { ascending: false })
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

  if (!form) return <div className="pantalla-carga">Cargando…</div>

  const copy = COPY[form.rol] ?? COPY.cliente
  const cambiar = (campo) => (e) =>
    setForm((prev) => ({ ...prev, [campo]: e.target.value }))

  const cambiarFoto = async (e) => {
    const archivo = e.target.files?.[0]
    if (!archivo) return
    if (archivo.size > TAM_MAX_FOTO) {
      setError('La foto no puede pesar más de 5 MB')
      return
    }
    setError('')
    setGuardando(true)
    try {
      const url = await subirFoto(archivo, usuario.id)
      await supabase.from('perfiles').update({ foto_url: url }).eq('id', usuario.id)
      setForm((prev) => ({ ...prev, foto_url: url }))
      await refrescarPerfil()
      setMensaje('Foto actualizada')
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
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
    setMensaje('Descarga preparada')
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
      setError(
        errorBorrado.message.includes('Could not find the function')
          ? 'Falta ejecutar supabase/11_borrar_mi_cuenta.sql en Supabase'
          : errorBorrado.message
      )
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
      setError('Elige tu provincia y tu municipio')
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
        resumen: (form.resumen ?? '').trim(),
        visible: form.visible,
      })
      .eq('id', usuario.id)

    setGuardando(false)
    if (errorGuardar) {
      setError(errorGuardar.message)
      return
    }
    await refrescarPerfil()
    setMensaje('Cambios guardados')
  }

  const estado = ESTADO_RESUMEN[form.resumen_estado] ?? ESTADO_RESUMEN.pendiente

  return (
    <div className="app-layout">
      <NavApp />
      <main className="app-main app-main--perfil">
        <header className="app-cabecera">
          <h1>Mi perfil</h1>
          <p>Así te ven los demás. Tu teléfono nunca aparece sin match.</p>
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
            <label className="campo-etiqueta">Foto</label>
            <input type="file" accept="image/*" onChange={cambiarFoto} />
            {form.foto_url && (
              <span className={`estado-resumen estado-resumen--${(ESTADO_FOTO[form.foto_estado] ?? ESTADO_FOTO.pendiente).clase}`}>
                {(ESTADO_FOTO[form.foto_estado] ?? ESTADO_FOTO.pendiente).texto}
              </span>
            )}

            <label className="campo-etiqueta">Nombre</label>
            <input type="text" value={form.nombre} onChange={cambiar('nombre')} maxLength={80} required />

            <label className="campo-etiqueta">WhatsApp</label>
            <input type="tel" value={form.telefono} onChange={cambiar('telefono')} maxLength={20} required />

            <SelectorUbicacion
              provincia={form.provincia}
              municipio={form.ciudad}
              onChange={(u) => setForm((prev) => ({ ...prev, ...u }))}
            />

            <label className="campo-etiqueta">{copy.categoria}</label>
            <SelectorServicio value={form.categoria} onChange={cambiar('categoria')} />

            <label className="campo-etiqueta">
              {copy.precio.replace('hora', unidadPrecio(form.categoria))} (€)
            </label>
            <input
              type="number" min="0" max="1000" step="0.5"
              value={form.precio_hora}
              onChange={cambiar('precio_hora')}
              required
            />

            <label className="campo-etiqueta">Resumen</label>
            <textarea
              value={form.resumen ?? ''}
              onChange={cambiar('resumen')}
              maxLength={LIMITE_RESUMEN}
              rows={3}
              placeholder={copy.resumenPlaceholder}
            />
            <span className={`estado-resumen estado-resumen--${estado.clase}`}>
              {(form.resumen ?? '').length}/{LIMITE_RESUMEN} · {estado.texto}
            </span>

            <label className="campo-interruptor">
              <input
                type="checkbox"
                checked={form.visible}
                onChange={(e) => setForm((p) => ({ ...p, visible: e.target.checked }))}
              />
              Aparecer en las búsquedas
            </label>

            <button type="submit" disabled={guardando}>
              {guardando ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </form>

        </div>

        <div className="perfil-extra">
        {misDenuncias.length > 0 && (
          <section className="zona-denuncias">
            <h2>Denuncias que has enviado</h2>
            <p>
              No te decimos contra quién por privacidad, pero sí en qué ha
              quedado cada una.
            </p>
            <ul>
              {misDenuncias.map((d, i) => (
                <li key={i}>
                  <span>{d.motivo}</span>
                  <span className={`pastilla-estado pastilla-estado--${d.estado}`}>
                    {d.estado === 'pendiente' ? 'en revisión'
                      : d.estado === 'revisada' ? 'revisada, se tomaron medidas'
                      : 'revisada, sin medidas'}
                  </span>
                  <small>{new Date(d.creado_en).toLocaleDateString('es-ES')}</small>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="zona-datos">
            <h2>Mis datos</h2>
            <p>
              Descarga todo lo que CleanDerApp guarda sobre ti: tu perfil, tus
              matches, tus valoraciones y tus decisiones.
            </p>
            <button type="button" onClick={descargarDatos}>
              Descargar mis datos
            </button>
        </section>

        <section className="zona-peligro">
          {!verBorrado ? (
            <button
              type="button"
              className="abrir-borrado"
              onClick={() => setVerBorrado(true)}
            >
              Eliminar mi cuenta
            </button>
          ) : (
          <>
            <h2>Eliminar mi cuenta</h2>
            <p>
              Se borrarán tu perfil, tu foto, tus matches y tus valoraciones.
              Quien haya hecho match contigo dejará de ver tu teléfono.
              <strong> No se puede deshacer.</strong>
            </p>
            <label className="campo-etiqueta" htmlFor="confirmar-borrado">
              Escribe <code>BORRAR</code> para confirmar
            </label>
            <input
              id="confirmar-borrado"
              type="text"
              value={confirmacion}
              onChange={(e) => setConfirmacion(e.target.value)}
              placeholder="BORRAR"
              autoComplete="off"
            />
            <button
              type="button"
              className="boton-peligro"
              disabled={confirmacion.trim().toUpperCase() !== 'BORRAR' || borrando}
              onClick={borrarCuenta}
            >
              {borrando ? 'Eliminando…' : 'Eliminar mi cuenta definitivamente'}
            </button>
            <button
              type="button"
              className="boton-retirar"
              onClick={() => { setVerBorrado(false); setConfirmacion('') }}
            >
              Cancelar
            </button>
          </>
          )}
        </section>
        </div>
      </main>
    </div>
  )
}
