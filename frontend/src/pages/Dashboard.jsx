import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import DashboardCliente from './DashboardCliente'
import DashboardProfesional from './DashboardProfesional'

export default function Dashboard() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!usuario) {
      navigate('/login')
    }
  }, [usuario, navigate])

  if (!usuario) return <div>Cargando...</div>

  // Si es admin, redirigir al panel de admin
  if (usuario.es_admin) {
    navigate('/admin')
    return null
  }

  // Si es cliente, mostrar pantalla de cliente
  if (usuario.tipo === 'CLIENTE') {
    return <DashboardCliente />
  }

  // Si es profesional, mostrar pantalla de profesional
  if (usuario.tipo === 'PROFESIONAL') {
    return <DashboardProfesional />
  }

  return <div>Tipo de usuario desconocido</div>
}
