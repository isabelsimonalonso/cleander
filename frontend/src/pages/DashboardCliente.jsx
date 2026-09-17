import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { profesionales } from '../services/api'
import '../styles/dashboard.css'

export default function DashboardCliente() {
  const { usuario: usuarioAuth, logout } = useAuth()
  const [usuario, setUsuario] = useState(usuarioAuth)
  const [servicios, setServicios] = useState([])
  const [profesionalesList, setProfesionalesList] = useState([])
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null)
  const [editando, setEditando] = useState(false)
  const [tab, setTab] = useState('buscar')
  const [matches, setMatches] = useState([])
  const [formData, setFormData] = useState({
    nombre: usuario?.nombre || '',
    telefono: usuario?.telefono || ''
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarServicios()
  }, [])

  useEffect(() => {
    if (servicioSeleccionado) {
      cargarProfesionales()
    }
  }, [servicioSeleccionado])

  useEffect(() => {
    if (tab === 'matches') {
      cargarMatches()
    }
  }, [tab])

  const cargarServicios = async () => {
    try {
      const { data } = await profesionales.servicios()
      setServicios(data)
      if (data.length > 0) {
        setServicioSeleccionado(data[0].id)
      }
    } catch (err) {
      console.error('Error cargando servicios:', err)
    } finally {
      setLoading(false)
    }
  }

  const cargarProfesionales = async () => {
    setLoading(true)
    try {
      const { data } = await profesionales.buscar({ servicioId: servicioSeleccionado })
      setProfesionalesList(data)
    } catch (err) {
      console.error('Error cargando profesionales:', err)
    } finally {
      setLoading(false)
    }
  }

  const cargarMatches = async () => {
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

  const solicitarMatch = async (profesionalId) => {
    try {
      const res = await fetch('http://localhost:5000/api/matches', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ profesional_id: profesionalId })
      })

      if (res.ok) {
        alert('✅ Solicitud enviada. El profesional verá tu solicitud')
        cargarProfesionales()
      }
    } catch (err) {
      console.error('Error en solicitud:', err)
    }
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Cleander</h1>
        <div className="user-info">
          <span>👤 {usuario?.nombre}</span>
          <button onClick={logout}>Salir</button>
        </div>
      </header>

      <nav className="dashboard-tabs">
        <button className={tab === 'buscar' ? 'active' : ''} onClick={() => setTab('buscar')}>
          🔍 Buscar Profesionales
        </button>
        <button className={tab === 'matches' ? 'active' : ''} onClick={() => setTab('matches')}>
          💬 Mis Matches
        </button>
      </nav>

      <div className="cliente-container">
        {/* LADO IZQUIERDO - Perfil */}
        <div className="cliente-perfil-sidebar">
          <div className="perfil-card-compact">
            <div className="perfil-foto-small">
              {usuario?.foto_perfil_url ? (
                <img src={usuario.foto_perfil_url} alt={usuario.nombre} />
              ) : (
                <div className="foto-placeholder-small">Sin foto</div>
              )}
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
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-guardar" onClick={guardarPerfil}>
                    💾 Guardar
                  </button>
                  <button type="button" className="btn-cancelar" onClick={() => {
                    setEditando(false)
                    setFormData({
                      nombre: usuario?.nombre || '',
                      telefono: usuario?.telefono || ''
                    })
                  }}>
                    ✕ Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <div className="perfil-info-compact">
                <h3>{usuario?.nombre}</h3>
                <p className="email">📧 {usuario?.email}</p>
                <p className="telefono">📱 {usuario?.telefono}</p>

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

        {/* LADO DERECHO */}
        {tab === 'buscar' && (
          <div className="cliente-profesionales-main">
            <div className="filtros-top">
              <h2>🔍 Buscar Profesionales</h2>
              <select
                value={servicioSeleccionado || ''}
                onChange={(e) => setServicioSeleccionado(Number(e.target.value))}
                className="select-servicio"
              >
                {servicios.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="loading">Cargando profesionales...</div>
            ) : profesionalesList.length === 0 ? (
              <div className="empty-state">
                <p>No hay profesionales disponibles en este servicio</p>
              </div>
            ) : (
              <div className="cards-container">
                {profesionalesList.map(prof => (
                  <div key={prof.id} className="prof-card">
                    <div className="card-header">
                      <h3>{prof.nombre}</h3>
                      <span className="tag-ofrezo">Ofrezo</span>
                    </div>

                    {prof.foto_perfil_url && (
                      <div className="card-foto">
                        <img src={prof.foto_perfil_url} alt={prof.nombre} />
                      </div>
                    )}

                    <div className="card-info">
                      <p className="precio">💰 €{prof.precio_por_hora}/h</p>
                      <p className="experiencia">📊 {prof.nivel_experiencia}</p>
                      <p className="rating">⭐ {prof.valoracion_media?.toFixed(1) || 'Sin rating'}</p>
                    </div>

                    <button
                      className="btn-match"
                      onClick={() => solicitarMatch(prof.id)}
                    >
                      📨 Solicitar Match
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'matches' && (
          <div className="cliente-profesionales-main">
            <h2>💬 Mis Solicitudes de Match</h2>
            {matches.length === 0 ? (
              <div className="empty-state">
                <p>Aún no has solicitado ningún match</p>
              </div>
            ) : (
              <div className="matches-list">
                {matches.map(match => (
                  <div key={match.id} className="match-card">
                    <div className="match-info">
                      <h3>{match.profesional_nombre}</h3>
                      <p className="match-estado">
                        {match.estado === 'PENDIENTE' && (
                          <span className="estado-badge pendiente">⏳ Pendiente de respuesta</span>
                        )}
                        {match.estado === 'ACEPTADO' && (
                          <span className="estado-badge aceptado">✅ Match Aceptado</span>
                        )}
                        {match.estado === 'RECHAZADO' && (
                          <span className="estado-badge rechazado">❌ Match Rechazado</span>
                        )}
                      </p>
                      <p className="match-fecha">Desde: {new Date(match.creado_en).toLocaleDateString('es-ES')}</p>
                    </div>

                    {match.estado === 'ACEPTADO' && (
                      <div className="match-contacto">
                        <p className="label">📍 Datos de contacto:</p>
                        <p>📞 {match.profesional_telefono}</p>
                        <p>📧 {match.profesional_email}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
