import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { auth } from '../services/api'
import Logo from '../components/Logo'
import '../styles/auth.css'

export default function Registro() {
  const [tipo, setTipo] = useState('CLIENTE')
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    password: '',
    fotoPerfil: '',
    precioHora: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!formData.nombre || !formData.email || !formData.telefono || !formData.fotoPerfil) {
        throw new Error('Por favor completa todos los campos obligatorios')
      }

      if (tipo === 'PROFESIONAL' && !formData.precioHora) {
        throw new Error('Profesionales deben especificar el precio por hora')
      }

      const datos = {
        ...formData,
        tipo,
        precioHora: tipo === 'PROFESIONAL' ? parseFloat(formData.precioHora) : null,
      }

      const { data } = await auth.registro(datos)
      login(data.usuario, data.token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error en el registro')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="logo-container">
          <Logo size={80} />
        </div>
        <h1>Cleander</h1>
        <h2>Crear cuenta</h2>

        <div className="tipo-selector">
          <button
            className={tipo === 'CLIENTE' ? 'active' : ''}
            onClick={() => setTipo('CLIENTE')}
          >
            Busco Servicios
          </button>
          <button
            className={tipo === 'PROFESIONAL' ? 'active' : ''}
            onClick={() => setTipo('PROFESIONAL')}
          >
            Ofrezco Servicios
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="nombre"
            placeholder="Nombre completo"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="tel"
            name="telefono"
            placeholder="Teléfono"
            value={formData.telefono}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña (mínimo 6 caracteres)"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="fotoPerfil"
            placeholder="URL de foto de perfil (obligatoria)"
            value={formData.fotoPerfil}
            onChange={handleChange}
            required
          />

          {tipo === 'PROFESIONAL' && (
            <input
              type="number"
              name="precioHora"
              placeholder="Precio por hora (€)"
              step="0.01"
              value={formData.precioHora}
              onChange={handleChange}
              required
            />
          )}

          <button type="submit" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
      </div>
    </div>
  )
}
