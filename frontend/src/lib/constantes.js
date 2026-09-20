/**
 * Servicios agrupados. El desplegable los muestra por bloques, que con
 * esta cantidad es la única forma de que se encuentren.
 *
 * En la base de datos se guarda el texto tal cual, así que añadir uno
 * nuevo es escribir una línea aquí: no hace falta tocar nada más.
 */
export const GRUPOS_SERVICIOS = [
  {
    grupo: 'Limpieza y hogar',
    servicios: [
      'Limpieza',
      'Limpieza de cristales',
      'Limpieza de fin de obra',
      'Planchado y lavandería',
      'Control de plagas',
    ],
  },
  {
    // Alquiler de máquinas, no mano de obra: quien ofrece presta el aparato
    // y quien busca lo necesita unos días. El precio por hora se entiende
    // como tarifa de alquiler.
    grupo: 'Robótica y maquinaria en alquiler',
    servicios: [
      'Alquiler de robot aspirador',
      'Alquiler de robot fregasuelos',
      'Alquiler de robot limpiacristales',
      'Alquiler de robot limpiafondos de piscina',
      'Alquiler de robot cortacésped',
      'Alquiler de aspirador industrial',
      'Alquiler de máquina de vapor',
      'Alquiler de hidrolimpiadora',
      'Alquiler de abrillantadora de suelos',
      'Alquiler de limpiamoquetas',
      'Alquiler de deshumidificador',
      'Alquiler de generador eléctrico',
      'Alquiler de andamio o escalera',
      'Alquiler de herramienta eléctrica',
    ],
  },
  {
    grupo: 'Instalaciones y averías',
    servicios: [
      'Fontanería',
      'Electricidad',
      'Calefacción y calderas',
      'Aire acondicionado',
      'Cerrajería',
      'Desatascos',
      'Reparación de electrodomésticos',
      'Antenas y televisión',
      'Informática y redes',
      'Placas solares',
    ],
  },
  {
    grupo: 'Obra y acabados',
    servicios: [
      'Albañilería',
      'Pintura',
      'Carpintería',
      'Escayola y pladur',
      'Suelos y parquet',
      'Ventanas y cristalería',
      'Persianas y toldos',
      'Reformas integrales',
    ],
  },
  {
    grupo: 'Exteriores',
    servicios: [
      'Jardinería',
      'Piscinas',
      'Limpieza de tejados y canalones',
    ],
  },
  {
    grupo: 'Muebles y mudanzas',
    servicios: [
      'Montaje de muebles',
      'Mudanzas',
      'Portes y transporte',
      'Tapicería',
      'Vaciado de pisos',
    ],
  },
  {
    grupo: 'Cuidados a domicilio',
    servicios: [
      'Cuidado de mayores',
      'Cuidado de niños',
      'Cuidado de mascotas',
    ],
  },
  {
    grupo: 'Otros',
    servicios: [
      'Reparaciones generales',
      'Costura y arreglos de ropa',
      'Cocina a domicilio',
      'Clases particulares',
      'Peluquería y estética a domicilio',
    ],
  },
]

/** Lista plana, para validar y para recorrer sin los grupos. */
export const CATEGORIAS = GRUPOS_SERVICIOS.flatMap((g) => g.servicios)

/**
 * El alquiler se cobra por día, no por hora: nadie alquila una
 * hidrolimpiadora sesenta minutos.
 *
 * En la base de datos la columna sigue llamándose `precio_hora` y guarda
 * un número a secas; lo único que cambia es cómo se lee según el servicio.
 */
const SERVICIOS_ALQUILER = new Set(
  GRUPOS_SERVICIOS.find((g) => g.grupo.includes('alquiler'))?.servicios ?? []
)

export const esAlquiler = (categoria) => SERVICIOS_ALQUILER.has(categoria)

/** Lo que se propone al elegir servicio; luego cada uno lo cambia. */
export const unidadSugerida = (categoria) => (esAlquiler(categoria) ? 'dia' : 'hora')

/** "hora" o "día", para las etiquetas de los formularios. */
export const unidadPrecio = (unidad) => (unidad === 'dia' ? 'día' : 'hora')

/** "/h" o "/día", para la esquina de la tarjeta. */
export const unidadCorta = (unidad) => (unidad === 'dia' ? '/día' : '/h')

export const ROLES = {
  CLIENTE: 'cliente',
  SERVICIO: 'servicio',
  ADMIN: 'admin',
}

/** Textos que cambian según quién mira, para reutilizar las mismas pantallas. */
export const COPY = {
  cliente: {
    etiqueta: 'Busco',
    precio: 'Pago por hora',
    categoria: 'Servicio que necesito',
    descubrir: 'Profesionales disponibles',
    resumenPlaceholder: 'Qué necesitas exactamente (máx. 150 caracteres)',
  },
  servicio: {
    etiqueta: 'Ofrezco',
    precio: 'Cobro por hora',
    categoria: 'Servicio que ofrezco',
    descubrir: 'Clientes que buscan',
    resumenPlaceholder: 'Qué ofreces y tu experiencia (máx. 150 caracteres)',
  },
}

/**
 * Dirección de contacto, en un solo sitio.
 * Aparece en el aviso legal y en el mensaje de cuenta bloqueada.
 */
export const CONTACTO = 'info@cleanderapp.com'

/**
 * Redes sociales del pie.
 *
 * PROVISIONAL: apuntan a la portada de cada red. Cuando existan los
 * perfiles de CleanDerApp, sustituir por su dirección concreta, del
 * estilo https://www.instagram.com/cleanderapp/
 *
 * Una dirección vacía oculta ese icono.
 */
export const REDES = [
  { id: 'instagram', nombre: 'Instagram', url: 'https://www.instagram.com/' },
  { id: 'tiktok', nombre: 'TikTok', url: 'https://www.tiktok.com/' },
  { id: 'facebook', nombre: 'Facebook', url: 'https://www.facebook.com/' },
]

/** Motivos de denuncia. Lista cerrada, para poder filtrar y contar. */
export const MOTIVOS_DENUNCIA = [
  'Foto inapropiada',
  'Suplanta a otra persona',
  'Acoso o amenazas',
  'Intento de estafa',
  'Contenido sexual',
  'Publicidad o spam',
  'Datos falsos',
  'Otro',
]

export const LIMITE_RESUMEN = 150
export const TAM_MAX_FOTO = 5 * 1024 * 1024 // 5 MB
