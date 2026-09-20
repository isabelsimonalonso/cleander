export const CATEGORIAS = [
  'Limpieza',
  'Alquiler de robots de limpieza',
  'Fontanería',
  'Electricidad',
  'Aire acondicionado',
  'Reparaciones generales',
  'Jardinería',
  'Pintura',
  'Mudanzas',
]

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
