import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import '../styles/dashboard.css'

export default function DashboardProfesional() {
  const { usuario: usuarioAuth, logout } = useAuth()
  const [usuario, setUsuario] = useState(usuarioAuth)
  const [clientes, setClientes] = useState([])
  const [editando, setEditando] = useState(false)
  const [formData, setFormData] = useState({
    nombre: usuario?.nombre || '',
    precio_por_hora: usuario?.precio_por_hora || '',
    nivel_experiencia: usuario?.nivel_experiencia || 'PRINCIPIANTE'
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    cargarClientes()
  }, [])

  const cargarClientes = async () => {
    setLoading(true)
    try {
      // En realidad deberíamos obtener clientes de un endpoint
      // Por ahora mostramos datos demo
      setClientes([
        {
          id: 2,
          nombre: 'Test Cliente 1',
          email: 'cliente@test.local',
          telefono: '+34666000001',
          tipo: 'CLIENTE',
          foto_perfil_url: 'https://via.placeholder.com/150?text=Cliente1'
        },
        {
          id: 4,
          nombre: 'Test Cliente 2',
          email: 'cliente2@test.local',
          telefono: '+34666000002',
          tipo: 'CLIENTE',
          foto_perfil_url: 'https://via.placeholder.com/150?text=Cliente2'
        }
      ])
    } catch (err) {
      console.error('Error cargando clientes:', err)
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

  const hacerMatch = async (clienteId) => {
    try {
      const res = await fetch('http://localhost:5000/api/matches', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cliente_id: clienteId })
      })

      if (res.ok) {
        alert('Match realizado!')
        cargarClientes()
      }
    } catch (err) {
      console.error('Error en match:', err)
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

        {/* LADO DERECHO - Clientes para Match */}
        <div className="profesional-clientes-main">
          <h2>🔍 Clientes buscando</h2>

          {loading ? (
            <div className="loading">Cargando clientes...</div>
          ) : clientes.length === 0 ? (
            <div className="empty-state">
              <p>No hay clientes disponibles en este momento</p>
            </div>
          ) : (
            <div className="cards-container">
              {clientes.map(cliente => (
                <div key={cliente.id} className="cliente-card">
                  <div className="card-header">
                    <h3>{cliente.nombre}</h3>
                    <span className="tag-busco">Busco</span>
                  </div>

                  {cliente.foto_perfil_url && (
                    <div className="card-foto">
                      <img src={cliente.foto_perfil_url} alt={cliente.nombre} />
                    </div>
                  )}

                  <div className="card-info">
                    <p className="email">📧 {cliente.email}</p>
                    <p className="telefono">📱 {cliente.telefono}</p>
                  </div>

                  <button
                    className="btn-match-cliente"
                    onClick={() => hacerMatch(cliente.id)}
                  >
                    ✨ Contactar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
