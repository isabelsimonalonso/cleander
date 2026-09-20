import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Estrellas from './Estrellas'
import { unidadCorta } from '../lib/constantes'

const ETIQUETA_ROL = { admin: 'Administración', cliente: 'Busca servicio', servicio: 'Ofrece servicio' }

function Dato({ etiqueta, children }) {
  return (
    <div className="ficha-dato">
      <span>{etiqueta}</span>
      <strong>{children ?? '—'}</strong>
    </div>
  )
}

/**
 * Ficha completa de un usuario para la administración.
 *
 * Juzgar a alguien por una fila de tabla es difícil: aquí está todo junto,
 * incluido lo que aún no está aprobado y por tanto nadie más ve.
 */
export default function FichaUsuario({ usuario, nombrePorId, onCerrar, onActualizar }) {
  const [datos, setDatos] = useState(null)

  useEffect(() => {
    let activo = true

    Promise.all([
      supabase.from('matches')
        .select('usuario_a,usuario_b,creado_en')
        .or(`usuario_a.eq.${usuario.id},usuario_b.eq.${usuario.id}`),
      supabase.from('valoraciones')
        .select('autor,estrellas,creado_en').eq('destinatario', usuario.id),
      supabase.from('valoraciones')
        .select('destinatario,estrellas,creado_en').eq('autor', usuario.id),
      supabase.from('denuncias')
        .select('motivo,detalle,estado,creado_en').eq('denunciado', usuario.id),
      supabase.from('intereses')
        .select('decision').eq('emisor', usuario.id),
    ]).then(([matches, recibidas, dadas, denuncias, intereses]) => {
      if (!activo) return
      setDatos({
        matches: matches.data ?? [],
        recibidas: recibidas.data ?? [],
        dadas: dadas.data ?? [],
        denuncias: denuncias.data ?? [],
        intereses: intereses.data ?? [],
      })
    })

    return () => { activo = false }
  }, [usuario.id])

  const media = datos?.recibidas.length
    ? datos.recibidas.reduce((t, v) => t + v.estrellas, 0) / datos.recibidas.length
    : 0

  const fecha = (f) => new Date(f).toLocaleDateString('es-ES')

  return (
    <div className="modal-ficha" onClick={onCerrar}>
      <div className="modal-ficha-caja" onClick={(e) => e.stopPropagation()}>
        <button className="modal-ficha-cerrar" onClick={onCerrar} aria-label="Cerrar">×</button>

        {/* ── Cabecera ──────────────────────────────────────────────── */}
        <header className="ficha-cabecera">
          {usuario.foto_url ? (
            <img
              className={`ficha-foto foto-moderar--${usuario.foto_estado}`}
              src={usuario.foto_url}
              alt=""
            />
          ) : (
            <span className="ficha-foto ficha-foto--vacia">sin foto</span>
          )}
          <div>
            <h2>{usuario.nombre || '(sin nombre)'}</h2>
            <p>{ETIQUETA_ROL[usuario.rol]} · {usuario.categoria}</p>
            <Estrellas valor={media} total={datos?.recibidas.length ?? 0} tamano={17} />
            <div className="ficha-etiquetas">
              {usuario.bloqueado && <span className="pastilla pastilla--rechazada">bloqueado</span>}
              {!usuario.visible && <span className="pastilla pastilla--pendiente">oculto</span>}
              {usuario.foto_url && usuario.foto_estado !== 'aprobada' && (
                <span className="pastilla pastilla--pendiente">foto {usuario.foto_estado}</span>
              )}
              {usuario.resumen && usuario.resumen_estado !== 'aprobado' && (
                <span className="pastilla pastilla--pendiente">texto {usuario.resumen_estado}</span>
              )}
            </div>
          </div>
        </header>

        {/* ── Datos ─────────────────────────────────────────────────── */}
        <section className="ficha-rejilla">
          <Dato etiqueta="Email">{usuario.email}</Dato>
          <Dato etiqueta="WhatsApp">{usuario.telefono}</Dato>
          <Dato etiqueta="Dónde">
            {usuario.ciudad}
            {usuario.provincia && usuario.provincia !== usuario.ciudad ? `, ${usuario.provincia}` : ''}
          </Dato>
          <Dato etiqueta="Precio">
            {Number(usuario.precio_hora).toFixed(0)} €{unidadCorta(usuario.categoria)}
          </Dato>
          <Dato etiqueta="Alta">{fecha(usuario.creado_en)}</Dato>
          <Dato etiqueta="Decisiones">
            {datos ? `${datos.intereses.filter((i) => i.decision === 'like').length} sí · ${datos.intereses.filter((i) => i.decision === 'pass').length} no` : '…'}
          </Dato>
        </section>

        {/* ── Su texto ──────────────────────────────────────────────── */}
        {usuario.resumen && (
          <section className="ficha-bloque">
            <h3>Su descripción</h3>
            <p className="ficha-resumen">«{usuario.resumen}»</p>
            <div className="botones-moderacion">
              {usuario.resumen_estado !== 'aprobado' && (
                <button className="btn-ok" onClick={() => onActualizar(usuario.id, { resumen_estado: 'aprobado' })}>
                  Aprobar texto
                </button>
              )}
              {usuario.resumen_estado !== 'rechazado' && (
                <button className="btn-no" onClick={() => onActualizar(usuario.id, { resumen_estado: 'rechazado' })}>
                  Rechazar texto
                </button>
              )}
            </div>
          </section>
        )}

        {/* ── Denuncias ─────────────────────────────────────────────── */}
        {datos?.denuncias.length > 0 && (
          <section className="ficha-bloque ficha-bloque--alerta">
            <h3>Denuncias recibidas ({datos.denuncias.length})</h3>
            {datos.denuncias.map((d, i) => (
              <p key={i} className="ficha-denuncia">
                <strong>{d.motivo}</strong> · {d.estado} · {fecha(d.creado_en)}
                {d.detalle && <><br />«{d.detalle}»</>}
              </p>
            ))}
          </section>
        )}

        {/* ── Su actividad ──────────────────────────────────────────── */}
        <section className="ficha-bloque">
          <h3>Matches ({datos?.matches.length ?? 0})</h3>
          {datos?.matches.length ? (
            <ul className="ficha-lista">
              {datos.matches.map((m, i) => {
                const otro = m.usuario_a === usuario.id ? m.usuario_b : m.usuario_a
                return (
                  <li key={i}>
                    {nombrePorId[otro] ?? '(cuenta eliminada)'}
                    <small>{fecha(m.creado_en)}</small>
                  </li>
                )
              })}
            </ul>
          ) : <p className="tenue">Ninguno todavía.</p>}
        </section>

        <section className="ficha-bloque">
          <h3>Valoraciones</h3>
          <p className="ficha-votos">
            <strong>Recibidas:</strong>{' '}
            {datos?.recibidas.length
              ? datos.recibidas.map((v, i) => (
                  <span key={i} className="ficha-voto">
                    {v.estrellas}★ de {nombrePorId[v.autor] ?? '—'}
                  </span>
                ))
              : <span className="tenue">ninguna</span>}
          </p>
          <p className="ficha-votos">
            <strong>Dadas:</strong>{' '}
            {datos?.dadas.length
              ? datos.dadas.map((v, i) => (
                  <span key={i} className="ficha-voto">
                    {v.estrellas}★ a {nombrePorId[v.destinatario] ?? '—'}
                  </span>
                ))
              : <span className="tenue">ninguna</span>}
          </p>
        </section>
      </div>
    </div>
  )
}
