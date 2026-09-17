import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { profesionales } from '../services/api'
import '../styles/dashboard.css'

export default function DashboardCliente() {
  const { usuario, logout } = useAuth()
  const [servicios, setServicios] = useState([])
  const [profesionalesList, setProfesionalesList] = useState([])
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [tab, setTab] = useState('buscar')

  useEffect(() => {
    cargarServicios()
  }, [])

  useEffect(() => {
    if (servicioSeleccionado) {
      cargarProfesionales()
    }
  }, [servicioSeleccionado])

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
      setCargando(false)
    }
  }

  const cargarProfesionales = async () => {
    setCargando(true)
    try {
      const { data } = await profesionales.buscar({ servicioId: servicioSeleccionado })
      setProfesionalesList(data)
    } catch (err) {
      console.error('Error cargando profesionales:', err)
    } finally {
      setCargando(false)
    }
  }

  const hacerMatch = async (profesionalId) => {
    try {
      await fetch('http://localhost:5000/api/matches', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ profesional_id: profesionalId })
      })
      alert('Match realizado!')
      cargarProfesionales()
    } catch (err) {
      console.error('Error en match:', err)
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

      <main className="dashboard-main">
        <nav className="dashboard-tabs">
          <button className={tab === 'buscar' ? 'active' : ''} onClick={() => setTab('buscar')}>
            🔍 Buscar Profesionales
          </button>
          <button className={tab === 'matches' ? 'active' : ''} onClick={() => setTab('matches')}>
            💬 Mis Matches
          </button>
          <button className={tab === 'perfil' ? 'active' : ''} onClick={() => setTab('perfil')}>
            👤 Mi Perfil
          </button>
        </nav>

        <div className="dashboard-content">
          {/* Buscar Profesionales */}
          {tab === 'buscar' && (
            <div className="cliente-buscar">
              <div className="filtros">
                <h2>🔍 Buscar Profesionales</h2>
                <div className="filtro-group">
                  <label>Selecciona un servicio:</label>
                  <select
                    value={servicioSeleccionado || ''}
                    onChange={(e) => setServicioSeleccionado(Number(e.target.value))}
                  >
                    {servicios.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="contenido-principal">
                {cargando ? (
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
                          onClick={() => hacerMatch(prof.id)}
                        >
                          ✨ Contactar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mis Matches */}
          {tab === 'matches' && (
            <div className="cliente-matches">
              <h2>💬 Mis Matches</h2>
              <p>Tus matches aparecerán aquí</p>
            </div>
          )}

          {/* Mi Perfil */}
          {tab === 'perfil' && (
            <div className="cliente-perfil">
              <h2>👤 Mi Perfil</h2>
              <div className="perfil-info">
                <p><strong>Nombre:</strong> {usuario?.nombre}</p>
                <p><strong>Email:</strong> {usuario?.email}</p>
                <p><strong>Teléfono:</strong> {usuario?.telefono}</p>
                <button className="btn-editar">✏️ Editar Perfil</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
