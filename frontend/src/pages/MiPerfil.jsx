import { useEffect, useState } from 'react'
import { supabase, subirFoto } from '../lib/supabase'
import { CATEGORIAS, COPY, LIMITE_RESUMEN, TAM_MAX_FOTO } from '../lib/constantes'
import { useAuth } from '../context/AuthContext'
import NavApp from '../components/NavApp'
import Tarjeta from '../components/Tarjeta'
import '../styles/app.css'

const ESTADO_RESUMEN = {
  pendiente: { texto: 'Pendiente de revisión — aún no se ve en tu tarjeta', clase: 'pendiente' },
  aprobado: { texto: 'Aprobado y visible', clase: 'aprobado' },
  rechazado: { texto: 'Rechazado por el equipo — edítalo y vuelve a enviarlo', clase: 'rechazado' },
}

export default function MiPerfil() {
  const { usuario, perfil, refrescarPerfil } = useAuth()
  const [form, setForm] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (perfil) setForm(perfil)
  }, [perfil])

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

  const guardar = async (e) => {
    e.preventDefault()
    setError('')
    setMensaje('')
    setGuardando(true)

    const { error: errorGuardar } = await supabase
      .from('perfiles')
      .update({
        nombre: form.nombre.trim(),
        telefono: form.telefono.trim(),
        ciudad: form.ciudad.trim(),
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
      <main className="app-main">
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
                valoracion_media: 0,
                total_valoraciones: 0,
              }}
            />
          </section>

          <form className="perfil-formulario" onSubmit={guardar}>
            <label className="campo-etiqueta">Foto</label>
            <input type="file" accept="image/*" onChange={cambiarFoto} />

            <label className="campo-etiqueta">Nombre</label>
            <input type="text" value={form.nombre} onChange={cambiar('nombre')} maxLength={80} required />

            <label className="campo-etiqueta">WhatsApp</label>
            <input type="tel" value={form.telefono} onChange={cambiar('telefono')} maxLength={20} required />

            <label className="campo-etiqueta">Ciudad</label>
            <input type="text" value={form.ciudad} onChange={cambiar('ciudad')} maxLength={80} required />

            <label className="campo-etiqueta">{copy.categoria}</label>
            <select value={form.categoria} onChange={cambiar('categoria')}>
              {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            <label className="campo-etiqueta">{copy.precio} (€)</label>
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
      </main>
    </div>
  )
}
