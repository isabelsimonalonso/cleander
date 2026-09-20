/**
 * Contenido de «Sobre nosotros», en español e inglés.
 *
 * Es la única página con texto de verdad que se ve sin iniciar sesión,
 * así que es la que explica de qué va esto a quien llega de fuera.
 */
export const SOBRE = {
  es: {
    titulo: 'Sobre CleanDerApp',
    entradilla: 'Encontrar a alguien de confianza para arreglar algo en casa no debería costar tres llamadas y dos plantones.',

    secciones: [
      {
        titulo: 'Qué es',
        parrafos: [
          'CleanDerApp pone en contacto a quien necesita un servicio doméstico con quien lo ofrece. Limpieza, fontanería, electricidad, aire acondicionado, jardinería, mudanzas o el alquiler de una máquina para el fin de semana.',
          'Funciona por interés mutuo: cada uno ve tarjetas del otro lado y marca las que le interesan. Cuando el interés es de ambas partes, se intercambian los teléfonos y la conversación sigue por WhatsApp, fuera de aquí.',
        ],
      },
      {
        titulo: 'Cómo funciona',
        pasos: [
          {
            titulo: 'Te registras y dices qué buscas o qué ofreces',
            texto: 'Servicio, dónde, cuánto cobras o cuánto pagas, y dos líneas sobre ti. Nada más.',
          },
          {
            titulo: 'Ves tarjetas y marcas las que te interesan',
            texto: 'Con foto, precio, municipio y valoraciones de quienes ya trabajaron con esa persona.',
          },
          {
            titulo: 'Cuando hay interés por las dos partes, es match',
            texto: 'Solo entonces se desbloquean los teléfonos, y quedáis directamente.',
          },
        ],
      },
      {
        titulo: 'Tu teléfono no se publica',
        parrafos: [
          'Esto no es un detalle de la letra pequeña, es cómo está construida la aplicación. Mientras no haya match, tu teléfono no sale de la base de datos: no está en las tarjetas que ven los demás, no viaja a su navegador y no hay forma de sacarlo.',
          'Solo aparece cuando las dos partes se han elegido. Y si eliminas el match o tu cuenta, deja de estar disponible.',
        ],
      },
      {
        titulo: 'Qué hacemos y qué no',
        parrafos: [
          'Revisamos las fotografías y los textos antes de publicarlos, y atendemos las denuncias que nos llegan desde la propia aplicación.',
          'No intervenimos en los precios, no cobramos comisión, no gestionamos pagos y no somos parte del acuerdo al que lleguéis. Tampoco verificamos titulaciones ni seguros: eso lo tenéis que hablar vosotros. Lo explicamos con detalle en el aviso legal, sin rodeos.',
        ],
      },
      {
        titulo: 'Gratis',
        parrafos: [
          'Registrarse, buscar, hacer match e intercambiar teléfonos no cuesta nada. No hay comisión por servicio ni porcentaje sobre lo que cobréis.',
        ],
      },
      {
        titulo: 'Escríbenos',
        parrafos: [
          'Para dudas, sugerencias o para denunciar algo que hayas visto, estamos en la dirección de abajo. Contestamos.',
        ],
        contacto: true,
      },
    ],
  },

  en: {
    titulo: 'About CleanDerApp',
    entradilla: 'Finding someone you can trust to fix something at home should not take three phone calls and two no-shows.',

    secciones: [
      {
        titulo: 'What it is',
        parrafos: [
          'CleanDerApp connects people who need a home service with people who offer one. Cleaning, plumbing, electrical work, air conditioning, gardening, removals, or hiring a machine for the weekend.',
          'It works on mutual interest: each side sees cards from the other and marks the ones they like. When the interest goes both ways, phone numbers are exchanged and the conversation carries on over WhatsApp, away from here.',
        ],
      },
      {
        titulo: 'How it works',
        pasos: [
          {
            titulo: 'Sign up and say what you need or offer',
            texto: 'Service, where, what you charge or pay, and two lines about yourself. That is all.',
          },
          {
            titulo: 'Look through cards and mark the ones you like',
            texto: 'With photo, price, town and ratings from people who have already worked with them.',
          },
          {
            titulo: 'When both sides are interested, it is a match',
            texto: 'Only then are phone numbers unlocked, and you arrange things directly.',
          },
        ],
      },
      {
        titulo: 'Your phone number is never published',
        parrafos: [
          'This is not small print, it is how the app is built. Until there is a match, your phone number does not leave the database: it is not in the cards other people see, it never reaches their browser, and there is no way to extract it.',
          'It only appears once both sides have chosen each other. And if you remove the match or your account, it stops being available.',
        ],
      },
      {
        titulo: 'What we do and what we do not',
        parrafos: [
          'We review photographs and texts before publishing them, and we handle the reports that reach us from within the app.',
          'We do not get involved in prices, we take no commission, we handle no payments and we are not a party to whatever you agree. Nor do we verify qualifications or insurance: that is for you to discuss. The legal notice spells all of this out, plainly.',
        ],
      },
      {
        titulo: 'Free',
        parrafos: [
          'Signing up, searching, matching and exchanging phone numbers costs nothing. There is no service fee and no cut of what you charge.',
        ],
      },
      {
        titulo: 'Get in touch',
        parrafos: [
          'For questions, suggestions or to report something you have seen, we are at the address below. We do reply.',
        ],
        contacto: true,
      },
    ],
  },
}
