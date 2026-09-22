import { GRUPOS_SERVICIOS } from '../lib/constantes'

/**
 * El dibujo que ocupa el hueco de la foto cuando alguien no ha subido
 * ninguna. Antes iban las iniciales, que no dicen nada; el oficio sí.
 *
 * Se resuelve en tres pasos, para que nunca falte:
 *   1. la categoría exacta,
 *   2. si no, el grupo al que pertenece (los ocho de GRUPOS_SERVICIOS),
 *   3. si no, una llave inglesa.
 *
 * Así, el día que añadas una categoría nueva a `constantes.js`, la tarjeta
 * ya tiene icono sin tocar este archivo. Si le quieres uno propio, se
 * añade una línea en POR_CATEGORIA.
 */

// Trazo común. `currentColor` deja que el color lo ponga el CSS.
const T = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

const FIGURAS = {
  escoba: (
    <g {...T}>
      <line x1="17" y1="3" x2="11.5" y2="8.5" />
      <path d="M12 8l4 4-4.5 4.5a3.5 3.5 0 0 1-5 0l-1-1a3.5 3.5 0 0 1 0-5z" />
      <line x1="7.5" y1="12.5" x2="11.5" y2="16.5" />
    </g>
  ),
  ventana: (
    <g {...T}>
      <rect x="4" y="4" width="16" height="16" rx="1.5" />
      <line x1="12" y1="4" x2="12" y2="20" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <path d="M15.5 7.5l1.5 1.5-1.5 1.5" />
    </g>
  ),
  plancha: (
    <g {...T}>
      <path d="M3 16h13a4 4 0 0 0 4-4V9a3 3 0 0 0-3-3H9a6 6 0 0 0-6 6z" />
      <line x1="3" y1="19.5" x2="16" y2="19.5" />
    </g>
  ),
  insecto: (
    <g {...T}>
      <ellipse cx="12" cy="13.5" rx="3.8" ry="5.5" />
      <circle cx="12" cy="5.5" r="2" />
      <line x1="8.4" y1="10" x2="4.5" y2="8" />
      <line x1="15.6" y1="10" x2="19.5" y2="8" />
      <line x1="8.2" y1="13.5" x2="4" y2="13.5" />
      <line x1="15.8" y1="13.5" x2="20" y2="13.5" />
      <line x1="8.4" y1="17" x2="4.5" y2="19" />
      <line x1="15.6" y1="17" x2="19.5" y2="19" />
    </g>
  ),
  robot: (
    <g {...T}>
      <rect x="4.5" y="8.5" width="15" height="11" rx="3.5" />
      <circle cx="9.5" cy="13.5" r="1.3" />
      <circle cx="14.5" cy="13.5" r="1.3" />
      <line x1="12" y1="4.5" x2="12" y2="8.5" />
      <circle cx="12" cy="3.2" r="1.3" />
    </g>
  ),
  maquina: (
    <g {...T}>
      <rect x="5.5" y="9" width="13" height="9" rx="2" />
      <path d="M9 9V6.5a3 3 0 0 1 6 0V9" />
      <circle cx="9" cy="19.5" r="1.7" />
      <circle cx="15" cy="19.5" r="1.7" />
    </g>
  ),
  escalera: (
    <g {...T}>
      <line x1="7" y1="3" x2="7" y2="21" />
      <line x1="17" y1="3" x2="17" y2="21" />
      <line x1="7" y1="7.5" x2="17" y2="7.5" />
      <line x1="7" y1="12" x2="17" y2="12" />
      <line x1="7" y1="16.5" x2="17" y2="16.5" />
    </g>
  ),
  taladro: (
    <g {...T}>
      <path d="M4 9h8v5.5H6.5A2.5 2.5 0 0 1 4 12z" />
      <path d="M12 10.5h4l4-2v5l-4-2h-4z" />
      <path d="M7 14.5v3.5a2 2 0 0 0 2 2h1.5" />
    </g>
  ),
  llave: (
    <g {...T}>
      <path d="M15.5 3.5a5 5 0 0 0-6.2 6.2L3 16v4.5h4.5l6.3-6.3a5 5 0 0 0 6.2-6.2l-3 3-2.6-.7-.7-2.6z" />
    </g>
  ),
  rayo: (
    <g {...T}>
      <path d="M13 2.5 4.5 14H10l-1 7.5L19.5 10H13z" />
    </g>
  ),
  llama: (
    <g {...T}>
      <path d="M12 21a6 6 0 0 0 6-6c0-4-3-6.5-5-10-1.5 2.5-2 3.5-2 5.5 0 0-1.5-1-1.5-3C7.5 9.5 6 11.5 6 15a6 6 0 0 0 6 6z" />
    </g>
  ),
  copo: (
    <g {...T}>
      <line x1="12" y1="3" x2="12" y2="21" />
      <line x1="4.2" y1="7.5" x2="19.8" y2="16.5" />
      <line x1="4.2" y1="16.5" x2="19.8" y2="7.5" />
      <path d="M10 5l2 2 2-2M10 19l2-2 2 2" />
    </g>
  ),
  candado: (
    <g {...T}>
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8.5 10V7a3.5 3.5 0 0 1 7 0v3" />
      <circle cx="12" cy="15" r="1.4" />
    </g>
  ),
  sifon: (
    <g {...T}>
      <path d="M7.5 3.5v6.5a4.5 4.5 0 0 0 9 0V3.5" />
      <line x1="4.5" y1="3.5" x2="10.5" y2="3.5" />
      <line x1="13.5" y1="3.5" x2="19.5" y2="3.5" />
      <line x1="12" y1="15" x2="12" y2="21" />
    </g>
  ),
  lavadora: (
    <g {...T}>
      <rect x="5" y="3" width="14" height="18" rx="2.5" />
      <circle cx="12" cy="14" r="4" />
      <circle cx="8" cy="6.5" r="0.9" />
      <circle cx="11" cy="6.5" r="0.9" />
    </g>
  ),
  antena: (
    <g {...T}>
      <line x1="12" y1="21.5" x2="12" y2="11" />
      <line x1="12" y1="11" x2="5" y2="4" />
      <line x1="12" y1="11" x2="19" y2="4" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="7" y1="6" x2="17" y2="6" />
    </g>
  ),
  wifi: (
    <g {...T}>
      <path d="M2.5 8.5a15 15 0 0 1 19 0" />
      <path d="M5.5 12.5a10.5 10.5 0 0 1 13 0" />
      <path d="M8.5 16.5a6 6 0 0 1 7 0" />
      <circle cx="12" cy="20" r="1.2" />
    </g>
  ),
  placa: (
    <g {...T}>
      <rect x="3" y="12.5" width="18" height="7.5" rx="1" />
      <line x1="9" y1="12.5" x2="9" y2="20" />
      <line x1="15" y1="12.5" x2="15" y2="20" />
      <line x1="3" y1="16.2" x2="21" y2="16.2" />
      <circle cx="12" cy="6" r="2.8" />
      <path d="M12 1.5v1.3M12 9.2v1.3M6.8 6H5.5M18.5 6h-1.3" />
    </g>
  ),
  ladrillo: (
    <g {...T}>
      <rect x="3" y="6" width="18" height="5.5" rx="1" />
      <rect x="3" y="13" width="18" height="5.5" rx="1" />
      <line x1="10" y1="6" x2="10" y2="11.5" />
      <line x1="15" y1="13" x2="15" y2="18.5" />
    </g>
  ),
  rodillo: (
    <g {...T}>
      <rect x="3.5" y="4" width="13" height="6" rx="2" />
      <path d="M16.5 7h3a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H12v2" />
      <rect x="10" y="14" width="4" height="7" rx="1" />
    </g>
  ),
  martillo: (
    <g {...T}>
      <path d="M13.5 3 21 10.5l-3 3L10.5 6z" />
      <line x1="11.5" y1="8.5" x2="4.5" y2="15.5" />
      <path d="M4.5 15.5 3 20.5l5-1.5z" />
    </g>
  ),
  tablas: (
    <g {...T}>
      <rect x="3" y="4.5" width="18" height="15" rx="1" />
      <line x1="3" y1="9.5" x2="21" y2="9.5" />
      <line x1="3" y1="14.5" x2="21" y2="14.5" />
      <line x1="11" y1="4.5" x2="11" y2="9.5" />
      <line x1="7" y1="9.5" x2="7" y2="14.5" />
      <line x1="15" y1="14.5" x2="15" y2="19.5" />
    </g>
  ),
  persiana: (
    <g {...T}>
      <rect x="3" y="3.5" width="18" height="13.5" rx="1" />
      <line x1="3" y1="7.5" x2="21" y2="7.5" />
      <line x1="3" y1="11" x2="21" y2="11" />
      <line x1="3" y1="14.5" x2="21" y2="14.5" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </g>
  ),
  casa: (
    <g {...T}>
      <path d="M3 11l9-7.5 9 7.5" />
      <path d="M5.5 9.5V20.5h13V9.5" />
      <rect x="10" y="14.5" width="4" height="6" />
    </g>
  ),
  hoja: (
    <g {...T}>
      <path d="M20.5 3.5C10.5 3.5 4 8.5 4 15.5c0 2 .8 3.7.8 3.7s7.7-.8 11.7-4.7c3-3 4-11 4-11z" />
      <line x1="5" y1="19.5" x2="14" y2="10.5" />
    </g>
  ),
  agua: (
    <g {...T}>
      <path d="M2.5 11c2.4 0 2.4 2 4.8 2s2.4-2 4.7-2 2.4 2 4.8 2 2.4-2 4.7-2" />
      <path d="M2.5 16c2.4 0 2.4 2 4.8 2s2.4-2 4.7-2 2.4 2 4.8 2 2.4-2 4.7-2" />
      <path d="M7 8.5V5.5a2.2 2.2 0 0 1 4.4 0" />
    </g>
  ),
  tejado: (
    <g {...T}>
      <path d="M2 13 12 4.5 22 13" />
      <line x1="3" y1="15.5" x2="21" y2="15.5" />
      <line x1="7" y1="18" x2="7" y2="20" />
      <line x1="12" y1="18" x2="12" y2="21" />
      <line x1="17" y1="18" x2="17" y2="20" />
    </g>
  ),
  destornillador: (
    <g {...T}>
      <path d="M16.5 2 22 7.5l-3 3L13.5 5z" />
      <line x1="14.5" y1="7" x2="6.5" y2="15" />
      <path d="M6.5 15 3 21.5l6.5-3.5z" />
    </g>
  ),
  caja: (
    <g {...T}>
      <path d="M3 7.5l9-4.5 9 4.5v9.5l-9 4.5-9-4.5z" />
      <path d="M3 7.5l9 4.5 9-4.5" />
      <line x1="12" y1="12" x2="12" y2="21.5" />
    </g>
  ),
  furgoneta: (
    <g {...T}>
      <path d="M2 6.5h11v9.5H2z" />
      <path d="M13 9.5h4l4 4v2.5h-8z" />
      <circle cx="6.5" cy="18" r="1.9" />
      <circle cx="17" cy="18" r="1.9" />
    </g>
  ),
  sillon: (
    <g {...T}>
      <path d="M5.5 11V8a3 3 0 0 1 3-3h7a3 3 0 0 1 3 3v3" />
      <path d="M3 12.5a2 2 0 0 1 4 0V16h10v-3.5a2 2 0 0 1 4 0V19H3z" />
    </g>
  ),
  corazon: (
    <g {...T}>
      <path d="M12 20.5s-7.5-4.8-7.5-9.5a4.2 4.2 0 0 1 7.5-2.6 4.2 4.2 0 0 1 7.5 2.6c0 4.7-7.5 9.5-7.5 9.5z" />
    </g>
  ),
  cometa: (
    <g {...T}>
      <path d="M12 2.5 4.5 10 12 17.5 19.5 10z" />
      <line x1="12" y1="2.5" x2="12" y2="17.5" />
      <line x1="4.5" y1="10" x2="19.5" y2="10" />
      <path d="M12 17.5c0 2-2 1.5-2 4" />
    </g>
  ),
  huella: (
    <g {...T}>
      <ellipse cx="12" cy="16.5" rx="4.3" ry="3.8" />
      <ellipse cx="5.8" cy="11" rx="1.9" ry="2.4" />
      <ellipse cx="9.8" cy="7" rx="1.9" ry="2.4" />
      <ellipse cx="14.2" cy="7" rx="1.9" ry="2.4" />
      <ellipse cx="18.2" cy="11" rx="1.9" ry="2.4" />
    </g>
  ),
  aguja: (
    <g {...T}>
      <line x1="19.5" y1="4.5" x2="8" y2="16" />
      <circle cx="19.5" cy="4.5" r="1.4" />
      <path d="M8 16c-3 1.2-4 2.3-4.5 4.8 2.4-.5 3.5-1.6 4.5-4.8z" />
    </g>
  ),
  olla: (
    <g {...T}>
      <path d="M4 10.5h16v5.5a3.5 3.5 0 0 1-3.5 3.5h-9A3.5 3.5 0 0 1 4 16z" />
      <line x1="1.8" y1="12.5" x2="4" y2="12.5" />
      <line x1="20" y1="12.5" x2="22.2" y2="12.5" />
      <path d="M9.5 8c0-1.2 1-1.2 1-2.4s-1-1.2-1-2.4" />
      <path d="M14.5 8c0-1.2 1-1.2 1-2.4s-1-1.2-1-2.4" />
    </g>
  ),
  libro: (
    <g {...T}>
      <path d="M4 4h5.5A2.5 2.5 0 0 1 12 6.5v14a2.5 2.5 0 0 0-2.5-2.5H4z" />
      <path d="M20 4h-5.5A2.5 2.5 0 0 0 12 6.5v14a2.5 2.5 0 0 1 2.5-2.5H20z" />
    </g>
  ),
  tijeras: (
    <g {...T}>
      <circle cx="6.2" cy="18" r="2.4" />
      <circle cx="17.8" cy="18" r="2.4" />
      <line x1="8" y1="16.2" x2="18" y2="4" />
      <line x1="16" y1="16.2" x2="6" y2="4" />
    </g>
  ),
}

/** Categorías con dibujo propio. El resto cae en el icono de su grupo. */
const POR_CATEGORIA = {
  'Limpieza': 'escoba',
  'Limpieza de fin de obra': 'escoba',
  'Limpieza de cristales': 'ventana',
  'Planchado y lavandería': 'plancha',
  'Control de plagas': 'insecto',

  'Alquiler de aspirador industrial': 'maquina',
  'Alquiler de máquina de vapor': 'maquina',
  'Alquiler de hidrolimpiadora': 'maquina',
  'Alquiler de abrillantadora de suelos': 'maquina',
  'Alquiler de limpiamoquetas': 'maquina',
  'Alquiler de deshumidificador': 'maquina',
  'Alquiler de generador eléctrico': 'rayo',
  'Alquiler de andamio o escalera': 'escalera',
  'Alquiler de herramienta eléctrica': 'taladro',

  'Fontanería': 'llave',
  'Electricidad': 'rayo',
  'Calefacción y calderas': 'llama',
  'Aire acondicionado': 'copo',
  'Cerrajería': 'candado',
  'Desatascos': 'sifon',
  'Reparación de electrodomésticos': 'lavadora',
  'Antenas y televisión': 'antena',
  'Informática y redes': 'wifi',
  'Placas solares': 'placa',

  'Albañilería': 'ladrillo',
  'Pintura': 'rodillo',
  'Carpintería': 'martillo',
  'Escayola y pladur': 'rodillo',
  'Suelos y parquet': 'tablas',
  'Ventanas y cristalería': 'ventana',
  'Persianas y toldos': 'persiana',
  'Reformas integrales': 'casa',

  'Jardinería': 'hoja',
  'Piscinas': 'agua',
  'Limpieza de tejados y canalones': 'tejado',

  'Montaje de muebles': 'destornillador',
  'Mudanzas': 'caja',
  'Portes y transporte': 'furgoneta',
  'Tapicería': 'sillon',
  'Vaciado de pisos': 'caja',

  'Cuidado de mayores': 'corazon',
  'Cuidado de niños': 'cometa',
  'Cuidado de mascotas': 'huella',

  'Reparaciones generales': 'destornillador',
  'Costura y arreglos de ropa': 'aguja',
  'Cocina a domicilio': 'olla',
  'Clases particulares': 'libro',
  'Peluquería y estética a domicilio': 'tijeras',
}

/** Red de seguridad por grupo, para categorías que se añadan luego. */
const POR_GRUPO = {
  'Limpieza y hogar': 'escoba',
  'Robótica y maquinaria en alquiler': 'robot',
  'Instalaciones y averías': 'llave',
  'Obra y acabados': 'ladrillo',
  'Exteriores': 'hoja',
  'Muebles y mudanzas': 'caja',
  'Cuidados a domicilio': 'corazon',
  'Otros': 'destornillador',
}

// categoría → grupo, sacado de la misma lista que pinta el desplegable.
const GRUPO_DE = Object.fromEntries(
  GRUPOS_SERVICIOS.flatMap((g) => g.servicios.map((s) => [s, g.grupo])),
)

export function figuraDe(categoria) {
  // Los robots de alquiler comparten dibujo y son cinco; una regla evita
  // repetir cinco líneas iguales en POR_CATEGORIA.
  if (/^Alquiler de robot/.test(categoria || '')) return 'robot'
  return (
    POR_CATEGORIA[categoria] ||
    POR_GRUPO[GRUPO_DE[categoria]] ||
    'llave'
  )
}

export default function IconoCategoria({ categoria }) {
  return (
    <div className="tarjeta-icono">
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        {FIGURAS[figuraDe(categoria)]}
      </svg>
    </div>
  )
}
