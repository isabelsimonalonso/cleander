import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import '../styles/dashboard.css'

export default function DashboardProfesional() {
  const { usuario: usuarioAuth, logout } = useAuth()
  const [usuario, setUsuario] = useState(usuarioAuth)
  const [matches, setMatches] = useState([])
  const [editando, setEditando] = useState(false)
  const [formData, setFormData] = useState({
    nombre: usuario?.nombre || '',
    precio_por_hora: usuario?.precio_por_hora || '',
    nivel_experiencia: usuario?.nivel_experiencia || 'PRINCIPIANTE'
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    cargarMatches()
  }, [])

  const cargarMatches = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/matches', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      if (res.ok) {
        const data = await res.json()
        setMatches(data)
      }
    } catch (err) {
      console.error('Error cargando matches:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const guardarPerfil = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/perfil/me', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        const data = await res.json()
        setUsuario(data.usuario)
        setEditando(false)
        alert('Perfil actualizado!')
      }
    } catch (err) {
      console.error('Error guardando perfil:', err)
      alert('Error guardando perfil')
    }
  }

  const aceptarMatch = async (matchId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/matches/${matchId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ estado: 'ACEPTADO' })
      })
      if (res.ok) {
        cargarMatches()
        alert('✅ ¡Match aceptado! Ahora podéis contactaros')
      }
    } catch (err) {
      console.error('Error aceptando match:', err)
    }
  }

  const rechazarMatch = async (matchId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/matches/${matchId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ estado: 'RECHAZADO' })
      })
      if (res.ok) {
        cargarMatches()
      }
    } catch (err) {
      console.error('Error rechazando match:', err)
    }
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Cleander</h1>
        <div className="user-info">
          <span>👨‍💼 {usuario?.nombre}</span>
          <button onClick={logout}>Salir</button>
        </div>
      </header>

      <div className="profesional-container">
        {/* LADO IZQUIERDO - Perfil */}
        <div className="profesional-perfil-sidebar">
          <div className="perfil-card-compact">
            <div className="perfil-foto-small">
              {usuario?.foto_perfil_url ? (
                <img src={usuario.foto_perfil_url} alt={usuario.nombre} />
              ) : (
                <div className="foto-placeholder-small">Sin foto</div>
              )}
              <span className={`badge-verificado-small ${usuario?.foto_verificada ? 'verificada' : 'pendiente'}`}>
                {usuario?.foto_verificada ? '✅' : '⏳'}
              </span>
            </div>

            {editando ? (
              <form className="form-editar">
                <div className="form-group">
                  <label>Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Precio/hora (€)</label>
                  <input
                    type="number"
                    name="precio_por_hora"
                    value={formData.precio_por_hora}
                    onChange={handleChange}
                    step="0.01"
                  />
                </div>

                <div className="form-group">
                  <label>Experiencia</label>
                  <select
                    name="nivel_experiencia"
                    value={formData.nivel_experiencia}
                    onChange={handleChange}
                  >
                    <option value="PRINCIPIANTE">Principiante</option>
                    <option value="INTERMEDIO">Intermedio</option>
                    <option value="EXPERTO">Experto</option>
                  </select>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-guardar" onClick={guardarPerfil}>
                    💾 Guardar
                  </button>
                  <button type="button" className="btn-cancelar" onClick={() => {
                    setEditando(false)
                    setFormData({
                      nombre: usuario?.nombre || '',
                      precio_por_hora: usuario?.precio_por_hora || '',
                      nivel_experiencia: usuario?.nivel_experiencia || 'PRINCIPIANTE'
                    })
                  }}>
                    ✕ Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <div className="perfil-info-compact">
                <h3>{usuario?.nombre}</h3>
                <p className="precio">💰 €{usuario?.precio_por_hora}/h</p>
                <p className="experiencia">📊 {usuario?.nivel_experiencia}</p>
                <p className="rating">⭐ {usuario?.valoracion_media?.toFixed(1) || 'N/A'}</p>

                <button
                  className="btn-editar-compact"
                  onClick={() => setEditando(true)}
                >
                  ✏️ Editar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* LADO DERECHO - Solicitudes Pendientes */}
        <div className="profesional-clientes-main">
          <h2>📨 Solicitudes de Match</h2>

          {loading ? (
            <div className="loading">Cargando solicitudes...</div>
          ) : matches.length === 0 ? (
            <div className="empty-state">
              <p>No hay solicitudes de clientes en este momento</p>
            </div>
          ) : (
            <div className="matches-list">
              {matches.map(match => (
                <div key={match.id} className="match-card">
                  <div className="match-info">
                    <h3>{match.cliente_nombre}</h3>
                    <p className="match-estado">
                      {match.estado === 'PENDIENTE' && (
                        <span className="estado-badge pendiente">⏳ Pendiente tu respuesta</span>
                      )}
                      {match.estado === 'ACEPTADO' && (
                        <span className="estado-badge aceptado">✅ Match Aceptado</span>
                      )}
                      {match.estado === 'RECHAZADO' && (
                        <span className="estado-badge rechazado">❌ Rechazado</span>
                      )}
                    </p>
                    <p className="match-fecha">Desde: {new Date(match.creado_en).toLocaleDateString('es-ES')}</p>
                  </div>

                  {match.estado === 'PENDIENTE' && (
                    <div className="match-actions">
                      <button
                        className="btn-aceptar"
                        onClick={() => aceptarMatch(match.id)}
                      >
                        ✅ Aceptar
                      </button>
                      <button
                        className="btn-rechazar"
                        onClick={() => rechazarMatch(match.id)}
                      >
                        ❌ Rechazar
                      </button>
                    </div>
                  )}

                  {match.estado === 'ACEPTADO' && (
                    <div className="match-contacto">
                      <p className="label">📍 Datos de contacto:</p>
                      <p>📞 {match.cliente_telefono}</p>
                      <p>📧 {match.cliente_email}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
