import { unidadCorta, traducirDato } from '../lib/constantes'
import { useIdioma } from '../lib/i18n'
import Estrellas from './Estrellas'
import IconoWhatsApp from './IconoWhatsApp'
import IconoCategoria from './IconoCategoria'

/**
 * La tarjeta estilo Tinder. Sirve para los dos roles: solo cambian
 * la etiqueta de la esquina y el texto del precio.
 *
 * El teléfono se pinta de tres maneras:
 *   · `propio`   → tu propia tarjeta: lo ves entero, sin enlace a WhatsApp.
 *   · `telefono` → hay match: el número del otro, con botón de WhatsApp.
 *   · ninguno    → un número falso difuminado, para indicar que existe
 *                  pero está oculto hasta que haya match.
 */
export default function Tarjeta({ perfil, telefono = null, propio = false, children }) {
  const { t, idioma } = useIdioma()
  if (perfil.suspendido) {
    return (
      <article className="tarjeta tarjeta--suspendida">
        <div className="tarjeta-foto">
          <IconoCategoria categoria={perfil.categoria} />
        </div>
        <div className="tarjeta-cuerpo">
          <div className="tarjeta-cabecera">
            <h3>{perfil.nombre}</h3>
          </div>
          <p className="tarjeta-suspendida-aviso">
            {t('cuentaSuspendidaTarjeta')}
          </p>
        </div>
      </article>
    )
  }



  return (
    <article className="tarjeta">
      <div className="tarjeta-foto">
        {perfil.foto_url ? (
          <img src={perfil.foto_url} alt={perfil.nombre} loading="lazy" />
        ) : (
          <IconoCategoria categoria={perfil.categoria} />
        )}
        <span className={`tarjeta-etiqueta tarjeta-etiqueta--${perfil.rol}`}>
          {t(perfil.rol === 'servicio' ? 'etiquetaOfrezco' : 'etiquetaBusco')}
        </span>
      </div>

      <div className="tarjeta-cuerpo">
        <div className="tarjeta-cabecera">
          <h3>{perfil.nombre}</h3>
          <span className="tarjeta-precio">
            {Number(perfil.precio_hora).toFixed(0)} €
            <small>{unidadCorta(perfil.unidad_precio)}</small>
          </span>
        </div>

        <p className="tarjeta-categoria">{traducirDato(perfil.categoria, idioma)}</p>
        <p className="tarjeta-ciudad">
          📍 {perfil.ciudad}
          {perfil.provincia && perfil.provincia !== perfil.ciudad && (
            <span className="tarjeta-provincia">, {perfil.provincia}</span>
          )}
        </p>

        {perfil.resumen && <p className="tarjeta-resumen">{perfil.resumen}</p>}

        <Estrellas
          valor={Number(perfil.valoracion_media ?? 0)}
          total={Number(perfil.total_valoraciones ?? 0)}
        />

        <div className="tarjeta-telefono">
          {propio ? (
            <span className="tarjeta-telefono-propio">
              <span className="tarjeta-telefono-linea">
                <IconoWhatsApp size={17} />
                {perfil.telefono || t('sinTelefono')}
              </span>
              <small>{t('soloLoVesTu')}</small>
            </span>
          ) : telefono ? (
            <a
              className="tarjeta-whatsapp"
              href={`https://wa.me/${telefono.replace(/[^\d]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconoWhatsApp size={19} />
              {telefono}
            </a>
          ) : (
            <span className="tarjeta-telefono-oculto" aria-label={t('visibleAlMatch')}>
              <span className="tarjeta-telefono-linea">
                <IconoWhatsApp size={17} />
                <span className="pixelado">+34 600 000 000</span>
              </span>
              <small>{t('visibleAlMatch')}</small>
            </span>
          )}
        </div>

        {children}
      </div>
    </article>
  )
}
