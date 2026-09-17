import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import '../styles/admin.css'

export default function Admin() {
  const [stats, setStats] = useState(null)
  const [usuarios, setUsuarios] = useState([])
  const [profesionales, setProfesionales] = useState([])
  const [matches, setMatches] = useState([])
  const [tab, setTab] = useState('dashboard')
  const [loading, setLoading] = useState(false)
  const { token, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const headers = { Authorization: `Bearer ${token}` }

      const statsRes = await fetch('http://localhost:5000/api/admin/stats', { headers })
      if (statsRes.ok) setStats(await statsRes.json())

      if (tab === 'usuarios') {
        const res = await fetch('http://localhost:5000/api/admin/usuarios', { headers })
        if (res.ok) setUsuarios(await res.json())
      } else if (tab === 'profesionales') {
        const res = await fetch('http://localhost:5000/api/admin/profesionales', { headers })
        if (res.ok) setProfesionales(await res.json())
      } else if (tab === 'matches') {
        const res = await fetch('http://localhost:5000/api/admin/matches', { headers })
        if (res.ok) setMatches(await res.json())
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [tab])

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>🔐 Panel de Administración</h1>
        <button onClick={() => { logout(); navigate('/login') }}>Cerrar sesión</button>
      </div>

      {stats && (
        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-number">{stats.usuarios}</div>
            <div className="stat-label">Usuarios</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.profesionales}</div>
            <div className="stat-label">Profesionales</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.matches}</div>
            <div className="stat-label">Matches</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.resenas}</div>
            <div className="stat-label">Reseñas</div>
          </div>
        </div>
      )}

      <div className="admin-tabs">
        <button
          className={tab === 'dashboard' ? 'active' : ''}
          onClick={() => setTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={tab === 'usuarios' ? 'active' : ''}
          onClick={() => setTab('usuarios')}
        >
          Usuarios
        </button>
        <button
          className={tab === 'profesionales' ? 'active' : ''}
          onClick={() => setTab('profesionales')}
        >
          Profesionales
        </button>
        <button
          className={tab === 'matches' ? 'active' : ''}
          onClick={() => setTab('matches')}
        >
          Matches
        </button>
      </div>

      <div className="admin-content">
        {tab === 'dashboard' && stats && (
          <div className="dashboard-view">
            <p>Sistema funcionando correctamente ✅</p>
          </div>
        )}

        {tab === 'usuarios' && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Tipo</th>
                <th>Creado</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id}>
                  <td>#{u.id}</td>
                  <td>{u.nombre}</td>
                  <td>{u.email}</td>
                  <td><span className={`badge ${u.tipo.toLowerCase()}`}>{u.tipo}</span></td>
                  <td>{new Date(u.creado_en).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'profesionales' && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Precio/h</th>
                <th>Nivel</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {profesionales.map(p => (
                <tr key={p.id}>
                  <td>{p.nombre}</td>
                  <td>{p.email}</td>
                  <td>€{p.precio_por_hora.toFixed(2)}</td>
                  <td>{p.nivel_experiencia}</td>
                  <td>⭐ {p.valoracion_media?.toFixed(1) || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'matches' && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Profesional</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {matches.map(m => (
                <tr key={m.id}>
                  <td>{m.cliente}</td>
                  <td>{m.profesional}</td>
                  <td><span className={`badge ${m.estado.toLowerCase()}`}>{m.estado}</span></td>
                  <td>{new Date(m.creado_en).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
