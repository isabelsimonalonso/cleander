import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import '../styles/dashboard.css'

export default function DashboardProfesional() {
  const { usuario, logout } = useAuth()
  const [tab, setTab] = useState('perfil')
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (tab === 'matches') {
      cargarMatches()
    }
  }, [tab])

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
        alert('Match aceptado!')
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

      <main className="dashboard-main">
        <nav className="dashboard-tabs">
          <button className={tab === 'perfil' ? 'active' : ''} onClick={() => setTab('perfil')}>
            👨‍💼 Mi Perfil
          </button>
          <button className={tab === 'matches' ? 'active' : ''} onClick={() => setTab('matches')}>
            💬 Mis Matches
          </button>
          <button className={tab === 'resenas' ? 'active' : ''} onClick={() => setTab('resenas')}>
            ⭐ Mis Reseñas
          </button>
        </nav>

        <div className="dashboard-content">
          {/* Mi Perfil */}
          {tab === 'perfil' && (
            <div className="profesional-perfil">
              <h2>👨‍💼 Mi Perfil Profesional</h2>

              <div className="perfil-card">
                <div className="perfil-foto">
                  {usuario?.foto_perfil_url ? (
                    <img src={usuario.foto_perfil_url} alt={usuario.nombre} />
                  ) : (
                    <div className="foto-placeholder">Sin foto</div>
                  )}
                  <span className={`badge-verificado ${usuario?.foto_verificada ? 'verificada' : 'pendiente'}`}>
                    {usuario?.foto_verificada ? '✅ Verificada' : '⏳ Pendiente'}
                  </span>
                </div>

                <div className="perfil-detalles">
                  <h3>{usuario?.nombre}</h3>
                  <p><strong>Email:</strong> {usuario?.email}</p>
                  <p><strong>Teléfono:</strong> {usuario?.telefono}</p>
                  <p><strong>Precio/hora:</strong> €{usuario?.precio_por_hora || 'No especificado'}</p>
                  <p><strong>Experiencia:</strong> {usuario?.nivel_experiencia || 'No especificado'}</p>
                  <p><strong>Rating:</strong> ⭐ {usuario?.valoracion_media?.toFixed(1) || 'Sin rating'}</p>
                </div>
              </div>

              <button className="btn-editar-perfil">✏️ Editar Perfil</button>
            </div>
          )}

          {/* Mis Matches */}
          {tab === 'matches' && (
            <div className="profesional-matches">
              <h2>💬 Mis Matches</h2>

              {loading ? (
                <div className="loading">Cargando matches...</div>
              ) : matches.length === 0 ? (
                <div className="empty-state">
                  <p>Aún no tienes matches. ¡Espera a que clientes te contacten!</p>
                </div>
              ) : (
                <div className="matches-list">
                  {matches.map(match => (
                    <div key={match.id} className="match-card">
                      <div className="match-info">
                        <h3>{match.cliente_nombre}</h3>
                        <p className="match-estado">
                          <span className={`estado-badge ${match.estado.toLowerCase()}`}>
                            {match.estado}
                          </span>
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
                          <p>📞 {match.cliente_telefono}</p>
                          <p>📧 {match.cliente_email}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Mis Reseñas */}
          {tab === 'resenas' && (
            <div className="profesional-resenas">
              <h2>⭐ Mis Reseñas</h2>
              <div className="resenas-summary">
                <div className="rating-big">⭐ {usuario?.valoracion_media?.toFixed(1) || 'N/A'}</div>
                <p>{usuario?.total_resenas || 0} reseñas</p>
              </div>
              <p className="empty-state">Tus reseñas aparecerán aquí</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
