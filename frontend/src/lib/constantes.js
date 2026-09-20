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
      'Alquiler de robots de limpieza',
      'Planchado y lavandería',
      'Control de plagas',
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

export const LIMITE_RESUMEN = 150
export const TAM_MAX_FOTO = 5 * 1024 * 1024 // 5 MB
