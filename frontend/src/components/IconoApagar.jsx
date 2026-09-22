import { useIdioma } from '../lib/i18n'

/**
 * El símbolo de apagado de toda la vida: el círculo abierto por arriba con
 * la raya en medio. Sustituye a la palabra «Salir» en la barra.
 *
 * Al no haber texto, el nombre va en `aria-label` y en `title`: quien use
 * un lector de pantalla lo oye, y quien deje el ratón encima lo lee.
 */
export default function IconoApagar({ size = 19 }) {
  const { t } = useIdioma()
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      role="img"
      aria-label={t('navSalir')}
    >
      <title>{t('navSalir')}</title>
      <path d="M12 3.5v8.5" />
      <path d="M6.4 6.9a7.8 7.8 0 1 0 11.2 0" />
    </svg>
  )
}
