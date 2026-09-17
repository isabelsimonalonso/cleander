import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { profesionales } from '../services/api'
import '../styles/dashboard.css'

export default function Dashboard() {
  const { usuario, logout } = useAuth()
  const [servicios, setServicios] = useState([])
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cargarServicios()
  }, [])

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

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Cleander</h1>
        <div className="user-info">
          <span>{usuario?.nombre}</span>
          <button onClick={logout}>Salir</button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="filtros">
          <h2>Filtrar por servicio</h2>
          <select
            value={servicioSeleccionado || ''}
            onChange={(e) => setServicioSeleccionado(Number(e.target.value))}
          >
            <option value="">Selecciona un servicio</option>
            {servicios.map(s => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="contenido-principal">
          {cargando ? (
            <div className="loading">Cargando...</div>
          ) : servicioSeleccionado ? (
            <div className="cards-container">
              <p>Tarjetas de profesionales aparecerán aquí</p>
            </div>
          ) : (
            <div className="empty-state">
              <p>Selecciona un servicio para ver profesionales</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
