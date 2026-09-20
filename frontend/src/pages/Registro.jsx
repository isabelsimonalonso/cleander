import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase, subirFoto } from '../lib/supabase'
import { LIMITE_RESUMEN, unidadPrecio, unidadSugerida } from '../lib/constantes'
import Logo from '../components/Logo'
import SelectorIdioma from '../components/SelectorIdioma'
import SelectorUbicacion from '../components/SelectorUbicacion'
import SelectorServicio from '../components/SelectorServicio'
import SubirFoto from '../components/SubirFoto'
import { useIdioma } from '../lib/i18n'
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
    unidad_precio: 'hora',
    resumen: '',
  })
  const [foto, setFoto] = useState(null)
  const [acepto, setAcepto] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { t } = useIdioma()

  const cambiar = (campo) => (e) => {
    const valor = e.target.value
    setDatos((prev) => ({
      ...prev,
      [campo]: valor,
      // Al elegir un alquiler se propone «por día», pero se puede cambiar
      ...(campo === 'categoria' ? { unidad_precio: unidadSugerida(valor) } : {}),
    }))
  }

  const [previa, setPrevia] = useState(null)

  const elegirFoto = (archivo) => {
    setFoto(archivo)
    setPrevia(URL.createObjectURL(archivo))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!acepto) {
      setError(t('errCondiciones'))
      return
    }
    if (!datos.categoria) {
      setError(t('errServicio'))
      return
    }
    if (!datos.provincia || !datos.ciudad) {
      setError(t('errUbicacion'))
      return
    }
    if (datos.password.length < 6) {
      setError(t('errContrasenaCorta'))
      return
    }
    if (!/^[+\d][\d\s]{7,}$/.test(datos.telefono.trim())) {
      setError(t('errTelefono'))
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
          unidad_precio: datos.unidad_precio,
          resumen: datos.resumen.trim(),
        },
      },
    })

    if (errorAlta) {
      setError(
        errorAlta.message.includes('already registered')
          ? t('errCorreoUsado')
          : errorAlta.message
      )
      setLoading(false)
      return
    }

    // Si en Supabase quedara activada la confirmación por correo, no habría
    // sesión todavía y no tendría sentido seguir.
    if (!data.session) {
      setLoading(false)
      setError(t('errConfirmaCorreo'))
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
      <SelectorIdioma flotante />
      <header className="auth-cabecera">
        <Logo variante="completo" />
        <p>{t('lema')}</p>
      </header>

      <div className="auth-box auth-box--ancho">
        <h1>{t('crearCuenta')}</h1>
        <h2>{t('eligeLado')}</h2>

        {error && <div className="error-message">{error}</div>}

        <div className="tipo-selector">
          <button
            type="button"
            className={rol === 'cliente' ? 'active' : ''}
            onClick={() => setRol('cliente')}
          >
            {t('buscoServicio')}
          </button>
          <button
            type="button"
            className={rol === 'servicio' ? 'active' : ''}
            onClick={() => setRol('servicio')}
          >
            {t('ofrezcoServicio')}
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder={t("nombre")}
            value={datos.nombre}
            onChange={cambiar('nombre')}
            maxLength={80}
            required
          />
          <input
            type="email"
            placeholder={t("email")}
            value={datos.email}
            onChange={cambiar('email')}
            required
          />
          <input
            type="password"
            placeholder={t("contrasenaMinima")}
            value={datos.password}
            onChange={cambiar('password')}
            required
          />
          <input
            type="tel"
            placeholder={t("whatsappEjemplo")}
            value={datos.telefono}
            onChange={cambiar('telefono')}
            maxLength={20}
            required
          />
          <span className="campo-nota">
            {t('telefonoOculto')}
          </span>
          <SelectorUbicacion
            provincia={datos.provincia}
            municipio={datos.ciudad}
            onChange={(u) => setDatos((prev) => ({ ...prev, ...u }))}
          />

          <label className="campo-etiqueta">{t(rol === 'servicio' ? 'categoriaServicio' : 'categoriaCliente')}</label>
          <SelectorServicio value={datos.categoria} onChange={cambiar('categoria')} />

          <label className="campo-etiqueta">
            {t(rol === 'servicio' ? 'precioServicio' : 'precioCliente', { unidad: unidadPrecio(datos.unidad_precio) })} (€)
          </label>
          <div className="precio-con-unidad">
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
            <select value={datos.unidad_precio} onChange={cambiar('unidad_precio')}>
              <option value="hora">{t('porHora')}</option>
              <option value="dia">{t('porDia')}</option>
            </select>
          </div>

          <textarea
            placeholder={t(rol === 'servicio' ? 'resumenServicio' : 'resumenCliente', { max: LIMITE_RESUMEN })}
            value={datos.resumen}
            onChange={cambiar('resumen')}
            maxLength={LIMITE_RESUMEN}
            rows={3}
          />
          <span className="campo-nota">
            {t('resumenNota', { n: datos.resumen.length, max: LIMITE_RESUMEN })}
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
              {t('aceptoCondiciones')}{' '}
              <Link to="/privacidad" target="_blank">
                {t('enlaceCondiciones')}
              </Link>.
            </span>
          </label>

          <button type="submit" disabled={loading || !acepto}>
            {loading ? t('creandoCuenta') : t('crearCuenta')}
          </button>
        </form>

        <p>{t('yaTienesCuenta')} <Link to="/login">{t('iniciaSesion')}</Link></p>
      </div>
    </div>
  )
}
