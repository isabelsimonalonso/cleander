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
 * Supabase exige un correo para iniciar sesión, pero quien administra
 * escribe solo "admin". Si lo tecleado no lleva arroba, se completa con
 * este dominio antes de enviarlo.
 */
export const DOMINIO_INTERNO = '@cleander.app'

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
  { id: 'correo', nombre: CONTACTO, url: `mailto:${CONTACTO}` },
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


/**
 * Los servicios se guardan en español en la base de datos; esto es solo
 * cómo se muestran en inglés. Así cambiar de idioma no toca los datos.
 */
export const SERVICIOS_EN = {
  'Limpieza y hogar': 'Cleaning and home',
  'Limpieza': 'Cleaning',
  'Limpieza de cristales': 'Window cleaning',
  'Limpieza de fin de obra': 'Post-construction cleaning',
  'Planchado y lavandería': 'Ironing and laundry',
  'Control de plagas': 'Pest control',

  'Robótica y maquinaria en alquiler': 'Robots and machinery for hire',
  'Alquiler de robot aspirador': 'Robot vacuum hire',
  'Alquiler de robot fregasuelos': 'Robot mop hire',
  'Alquiler de robot limpiacristales': 'Window-cleaning robot hire',
  'Alquiler de robot limpiafondos de piscina': 'Pool cleaning robot hire',
  'Alquiler de robot cortacésped': 'Robot lawnmower hire',
  'Alquiler de aspirador industrial': 'Industrial vacuum hire',
  'Alquiler de máquina de vapor': 'Steam cleaner hire',
  'Alquiler de hidrolimpiadora': 'Pressure washer hire',
  'Alquiler de abrillantadora de suelos': 'Floor polisher hire',
  'Alquiler de limpiamoquetas': 'Carpet cleaner hire',
  'Alquiler de deshumidificador': 'Dehumidifier hire',
  'Alquiler de generador eléctrico': 'Generator hire',
  'Alquiler de andamio o escalera': 'Scaffolding or ladder hire',
  'Alquiler de herramienta eléctrica': 'Power tool hire',

  'Instalaciones y averías': 'Installations and repairs',
  'Fontanería': 'Plumbing',
  'Electricidad': 'Electrical work',
  'Calefacción y calderas': 'Heating and boilers',
  'Aire acondicionado': 'Air conditioning',
  'Cerrajería': 'Locksmith',
  'Desatascos': 'Drain unblocking',
  'Reparación de electrodomésticos': 'Appliance repair',
  'Antenas y televisión': 'Aerials and TV',
  'Informática y redes': 'IT and networks',
  'Placas solares': 'Solar panels',

  'Obra y acabados': 'Building and finishes',
  'Albañilería': 'Bricklaying',
  'Pintura': 'Painting',
  'Carpintería': 'Carpentry',
  'Escayola y pladur': 'Plaster and drywall',
  'Suelos y parquet': 'Flooring and parquet',
  'Ventanas y cristalería': 'Windows and glazing',
  'Persianas y toldos': 'Blinds and awnings',
  'Reformas integrales': 'Full renovations',

  'Exteriores': 'Outdoors',
  'Jardinería': 'Gardening',
  'Piscinas': 'Swimming pools',
  'Limpieza de tejados y canalones': 'Roof and gutter cleaning',

  'Muebles y mudanzas': 'Furniture and removals',
  'Montaje de muebles': 'Furniture assembly',
  'Mudanzas': 'Removals',
  'Portes y transporte': 'Deliveries and transport',
  'Tapicería': 'Upholstery',
  'Vaciado de pisos': 'House clearance',

  'Cuidados a domicilio': 'Care at home',
  'Cuidado de mayores': 'Elderly care',
  'Cuidado de niños': 'Childcare',
  'Cuidado de mascotas': 'Pet care',

  'Otros': 'Other',
  'Reparaciones generales': 'General repairs',
  'Costura y arreglos de ropa': 'Sewing and clothing repairs',
  'Cocina a domicilio': 'Home cooking',
  'Clases particulares': 'Private lessons',
  'Peluquería y estética a domicilio': 'Hairdressing and beauty at home',
}

export const MOTIVOS_EN = {
  'Foto inapropiada': 'Inappropriate photo',
  'Suplanta a otra persona': 'Impersonating someone',
  'Acoso o amenazas': 'Harassment or threats',
  'Intento de estafa': 'Attempted scam',
  'Contenido sexual': 'Sexual content',
  'Publicidad o spam': 'Advertising or spam',
  'Datos falsos': 'False information',
  'Otro': 'Other',
}

/** Traduce un servicio, grupo o motivo. En español se devuelve tal cual. */
export const traducirDato = (texto, idioma) =>
  idioma === 'en' ? (SERVICIOS_EN[texto] ?? MOTIVOS_EN[texto] ?? texto) : texto

export const LIMITE_RESUMEN = 150
export const TAM_MAX_FOTO = 5 * 1024 * 1024 // 5 MB

/**
 * Longitud mínima de contraseña. Supabase rechaza menos de 6 con un error
 * en inglés; comprobándolo aquí el aviso sale en el idioma de quien escribe.
 */
export const MIN_CONTRASENA = 6

/**
 * Teléfono válido: empieza por + o por dígito y tiene al menos ocho cifras.
 * Se comprueba en el registro y al editar el perfil, porque de ese número
 * cuelga el enlace de WhatsApp que ve quien hace match.
 */
export const telefonoValido = (valor) => /^[+\d][\d\s]{7,}$/.test((valor ?? '').trim())
