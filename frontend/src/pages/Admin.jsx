import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import '../styles/admin.css'

export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState(null)
  const [usuarios, setUsuarios] = useState([])
  const [fotoPendientes, setFotoPendientes] = useState([])
  const [auditoria, setAuditoria] = useState([])
  const [loading, setLoading] = useState(false)
  const { token, logout } = useAuth()
  const navigate = useNavigate()

  // Cargar datos al montar
  useEffect(() => {
    cargarStats()
  }, [])

  // Cargar datos según la pestaña activa
  useEffect(() => {
    if (activeTab === 'fotos') cargarFotoPendientes()
    else if (activeTab === 'usuarios') cargarUsuarios()
    else if (activeTab === 'auditoria') cargarAuditoria()
  }, [activeTab])

  const cargarStats = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) setStats(await res.json())
    } catch (err) {
      console.error('Error cargando stats:', err)
    }
  }

  const cargarFotoPendientes = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/admin/fotos-pendientes', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) setFotoPendientes(await res.json())
    } catch (err) {
      console.error('Error cargando fotos:', err)
    } finally {
      setLoading(false)
    }
  }

  const cargarUsuarios = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/admin/usuarios', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) setUsuarios(await res.json())
    } catch (err) {
      console.error('Error cargando usuarios:', err)
    } finally {
      setLoading(false)
    }
  }

  const cargarAuditoria = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/admin/auditoria', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) setAuditoria(await res.json())
    } catch (err) {
      console.error('Error cargando auditoría:', err)
    } finally {
      setLoading(false)
    }
  }

  const aprobarFoto = async (usuarioId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/usuarios/${usuarioId}/foto/aprobar`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        cargarFotoPendientes()
        cargarStats()
      }
    } catch (err) {
      console.error('Error aprobando foto:', err)
    }
  }

  const rechazarFoto = async (usuarioId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/usuarios/${usuarioId}/foto/rechazar`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) cargarFotoPendientes()
    } catch (err) {
      console.error('Error rechazando foto:', err)
    }
  }

  const bloquearUsuario = async (usuarioId) => {
    const razon = prompt('Razón del bloqueo:')
    if (!razon) return

    try {
      const res = await fetch(`http://localhost:5000/api/admin/usuarios/${usuarioId}/bloquear`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ razon })
      })
      if (res.ok) {
        cargarUsuarios()
        cargarAuditoria()
      }
    } catch (err) {
      console.error('Error bloqueando usuario:', err)
    }
  }

  const desbloquearUsuario = async (usuarioId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/usuarios/${usuarioId}/desbloquear`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        cargarUsuarios()
        cargarAuditoria()
      }
    } catch (err) {
      console.error('Error desbloqueando usuario:', err)
    }
  }

  const eliminarUsuario = async (usuarioId) => {
    if (!confirm('¿Eliminar usuario permanentemente? (GDPR - No se puede deshacer)')) return

    try {
      const res = await fetch(`http://localhost:5000/api/admin/usuarios/${usuarioId}/gdpr`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        cargarUsuarios()
        cargarAuditoria()
        cargarStats()
      }
    } catch (err) {
      console.error('Error eliminando usuario:', err)
    }
  }

  return (
    <div className="admin-container">
      {/* Header */}
      <div className="admin-header">
        <h1>🔐 Panel Administración</h1>
        <button className="logout-btn" onClick={() => { logout(); navigate('/login') }}>
          Cerrar sesión
        </button>
      </div>

      {/* Stats */}
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
            <div className="stat-number">{fotoPendientes.length}</div>
            <div className="stat-label">Fotos pendientes</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.matches}</div>
            <div className="stat-label">Matches</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          className={activeTab === 'fotos' ? 'active' : ''}
          onClick={() => setActiveTab('fotos')}
        >
          📸 Fotos ({fotoPendientes.length})
        </button>
        <button
          className={activeTab === 'usuarios' ? 'active' : ''}
          onClick={() => setActiveTab('usuarios')}
        >
          👥 Usuarios
        </button>
        <button
          className={activeTab === 'auditoria' ? 'active' : ''}
          onClick={() => setActiveTab('auditoria')}
        >
          📋 Auditoría
        </button>
      </div>

      {/* Content */}
      <div className="admin-content">
        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-section">
            <h2>Bienvenido al Panel de Administración</h2>
            <div className="quick-actions">
              <div className="action-group">
                <h3>📸 Fotos Pendientes</h3>
                <p>Hay {fotoPendientes.length} fotos esperando validación</p>
                <button onClick={() => setActiveTab('fotos')} className="action-btn">
                  Ver fotos →
                </button>
              </div>
              <div className="action-group">
                <h3>👥 Gestión de Usuarios</h3>
                <p>Bloquea, elimina o gestiona usuarios</p>
                <button onClick={() => setActiveTab('usuarios')} className="action-btn">
                  Ver usuarios →
                </button>
              </div>
              <div className="action-group">
                <h3>📋 Auditoría</h3>
                <p>Revisa todas las acciones administrativas</p>
                <button onClick={() => setActiveTab('auditoria')} className="action-btn">
                  Ver auditoría →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Fotos Pendientes */}
        {activeTab === 'fotos' && (
          <div className="fotos-section">
            <h2>📸 Fotos Pendientes de Validación</h2>
            {loading ? (
              <p>Cargando...</p>
            ) : fotoPendientes.length === 0 ? (
              <p className="empty">✅ No hay fotos pendientes</p>
            ) : (
              <div className="fotos-grid">
                {fotoPendientes.map(foto => (
                  <div key={foto.id} className="foto-card">
                    <div className="foto-imagen">
                      <img src={foto.foto_perfil_url} alt={foto.nombre} />
                    </div>
                    <div className="foto-info">
                      <h3>{foto.nombre}</h3>
                      <p>{foto.email}</p>
                      <p className="tipo">Tipo: {foto.tipo}</p>
                      {foto.precio_por_hora && <p>€{foto.precio_por_hora}/h</p>}
                    </div>
                    <div className="foto-actions">
                      <button
                        className="btn-aprobar"
                        onClick={() => aprobarFoto(foto.id)}
                      >
                        ✅ Aprobar
                      </button>
                      <button
                        className="btn-rechazar"
                        onClick={() => rechazarFoto(foto.id)}
                      >
                        ❌ Rechazar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Usuarios */}
        {activeTab === 'usuarios' && (
          <div className="usuarios-section">
            <h2>👥 Todos los Usuarios</h2>
            {loading ? (
              <p>Cargando...</p>
            ) : usuarios.length === 0 ? (
              <p className="empty">Sin usuarios</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Tipo</th>
                    <th>Foto</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map(u => (
                    <tr key={u.id}>
                      <td><strong>{u.nombre}</strong></td>
                      <td>{u.email}</td>
                      <td>{u.telefono}</td>
                      <td><span className={`badge ${u.tipo.toLowerCase()}`}>{u.tipo}</span></td>
                      <td>{u.foto_verificada ? '✅' : '❌'}</td>
                      <td>
                        {u.usuario_bloqueado ? (
                          <span className="badge bloqueado">BLOQUEADO</span>
                        ) : (
                          <span className="badge activo">ACTIVO</span>
                        )}
                      </td>
                      <td className="acciones">
                        {u.usuario_bloqueado ? (
                          <button
                            className="btn-small desbloquear"
                            onClick={() => desbloquearUsuario(u.id)}
                          >
                            🔓 Desbloquear
                          </button>
                        ) : (
                          <button
                            className="btn-small bloquear"
                            onClick={() => bloquearUsuario(u.id)}
                          >
                            🔒 Bloquear
                          </button>
                        )}
                        <button
                          className="btn-small eliminar"
                          onClick={() => eliminarUsuario(u.id)}
                        >
                          🗑️ Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Auditoría */}
        {activeTab === 'auditoria' && (
          <div className="auditoria-section">
            <h2>📋 Registro de Auditoría</h2>
            {loading ? (
              <p>Cargando...</p>
            ) : auditoria.length === 0 ? (
              <p className="empty">Sin registros</p>
            ) : (
              <div className="auditoria-list">
                {auditoria.map(log => (
                  <div key={log.id} className="audit-entry">
                    <div className="audit-time">{new Date(log.creado_en).toLocaleString('es-ES')}</div>
                    <div className="audit-action">
                      <strong>{log.accion}</strong>
                    </div>
                    <div className="audit-detalles">
                      {log.detalles}
                    </div>
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
