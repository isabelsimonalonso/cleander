import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase, subirFoto } from '../lib/supabase'
import { COPY, LIMITE_RESUMEN, unidadPrecio } from '../lib/constantes'
import Logo from '../components/Logo'
import SelectorUbicacion from '../components/SelectorUbicacion'
import SelectorServicio from '../components/SelectorServicio'
import SubirFoto from '../components/SubirFoto'
import '../styles/auth.css'

export default function Registro() {
  const [rol, setRol] = useState('cliente')
  const [datos, setDatos] = useState({
    nombre: '',
    email: '',
    password: '',
    telefono: '',
    provincia: '',
    ciudad: '',
    categoria: '',
    precio_hora: '',
    resumen: '',
  })
  const [foto, setFoto] = useState(null)
  const [acepto, setAcepto] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const copy = COPY[rol]

  const cambiar = (campo) => (e) =>
    setDatos((prev) => ({ ...prev, [campo]: e.target.value }))

  const [previa, setPrevia] = useState(null)

  const elegirFoto = (archivo) => {
    setFoto(archivo)
    setPrevia(URL.createObjectURL(archivo))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!acepto) {
      setError('Debes aceptar el aviso legal y la política de privacidad')
      return
    }
    if (!datos.categoria) {
      setError('Elige el servicio')
      return
    }
    if (!datos.provincia || !datos.ciudad) {
      setError('Elige tu provincia y tu municipio')
      return
    }
    if (datos.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    if (!/^[+\d][\d\s]{7,}$/.test(datos.telefono.trim())) {
      setError('Escribe un teléfono de WhatsApp válido, por ejemplo +34 600 000 000')
      return
    }

    setLoading(true)

    // 1. Crear la cuenta. Los metadatos alimentan el trigger que crea el perfil.
    const { data, error: errorAlta } = await supabase.auth.signUp({
      email: datos.email.trim(),
      password: datos.password,
      options: {
        data: {
          rol,
          nombre: datos.nombre.trim(),
          telefono: datos.telefono.trim(),
          provincia: datos.provincia,
          ciudad: datos.ciudad,
          categoria: datos.categoria,
          precio_hora: datos.precio_hora || '0',
          resumen: datos.resumen.trim(),
        },
      },
    })

    if (errorAlta) {
      setError(
        errorAlta.message.includes('already registered')
          ? 'Ya existe una cuenta con ese email'
          : errorAlta.message
      )
      setLoading(false)
      return
    }

    // Si en Supabase quedara activada la confirmación por correo, no habría
    // sesión todavía y no tendría sentido seguir.
    if (!data.session) {
      setLoading(false)
      setError('Cuenta creada. Revisa tu correo para confirmarla y luego inicia sesión.')
      return
    }

    // 2. La foto va después, porque necesita la sesión ya creada.
    if (foto && data.user) {
      try {
        const url = await subirFoto(foto, data.user.id)
        await supabase.from('perfiles').update({ foto_url: url }).eq('id', data.user.id)
      } catch (err) {
        console.error('No se pudo subir la foto:', err)
        // No bloqueamos el registro: la foto se puede añadir desde Mi perfil.
      }
    }

    navigate('/descubrir')
  }

  return (
    <div className="auth-container">
      <header className="auth-cabecera">
        <Logo variante="completo" />
        <p>Match de servicios domésticos</p>
      </header>

      <div className="auth-box auth-box--ancho">
        <h1>Crear cuenta</h1>
        <h2>Elige si buscas un servicio o si lo ofreces</h2>

        {error && <div className="error-message">{error}</div>}

        <div className="tipo-selector">
          <button
            type="button"
            className={rol === 'cliente' ? 'active' : ''}
            onClick={() => setRol('cliente')}
          >
            Busco un servicio
          </button>
          <button
            type="button"
            className={rol === 'servicio' ? 'active' : ''}
            onClick={() => setRol('servicio')}
          >
            Ofrezco mi servicio
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nombre"
            value={datos.nombre}
            onChange={cambiar('nombre')}
            maxLength={80}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={datos.email}
            onChange={cambiar('email')}
            required
          />
          <input
            type="password"
            placeholder="Contraseña (mínimo 6 caracteres)"
            value={datos.password}
            onChange={cambiar('password')}
            required
          />
          <input
            type="tel"
            placeholder="WhatsApp (+34 600 000 000)"
            value={datos.telefono}
            onChange={cambiar('telefono')}
            maxLength={20}
            required
          />
          <span className="campo-nota">
            Tu teléfono permanece oculto. Solo se revela cuando hay match por ambas partes.
          </span>
          <SelectorUbicacion
            provincia={datos.provincia}
            municipio={datos.ciudad}
            onChange={(u) => setDatos((prev) => ({ ...prev, ...u }))}
          />

          <label className="campo-etiqueta">{copy.categoria}</label>
          <SelectorServicio value={datos.categoria} onChange={cambiar('categoria')} />

          <label className="campo-etiqueta">
            {copy.precio.replace('hora', unidadPrecio(datos.categoria))} (€)
          </label>
          <input
            type="number"
            min="0"
            max="1000"
            step="0.5"
            placeholder="15"
            value={datos.precio_hora}
            onChange={cambiar('precio_hora')}
            required
          />

          <textarea
            placeholder={copy.resumenPlaceholder}
            value={datos.resumen}
            onChange={cambiar('resumen')}
            maxLength={LIMITE_RESUMEN}
            rows={3}
          />
          <span className="campo-nota">
            {datos.resumen.length}/{LIMITE_RESUMEN} · lo revisa el equipo antes de publicarse
          </span>

          <SubirFoto
            vistaPrevia={previa}
            onArchivo={elegirFoto}
            onError={setError}
          />

          <label className="campo-acepto">
            <input
              type="checkbox"
              checked={acepto}
              onChange={(e) => setAcepto(e.target.checked)}
            />
            <span>
              Soy mayor de 18 años y he leído y acepto el{' '}
              <Link to="/privacidad" target="_blank">
                aviso legal, las condiciones de uso y la política de privacidad
              </Link>.
            </span>
          </label>

          <button type="submit" disabled={loading || !acepto}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
      </div>
    </div>
  )
}
