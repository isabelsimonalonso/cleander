/**
 * Aviso legal, condiciones de uso y privacidad, en español e inglés.
 *
 * Va aparte de textos.js porque es muy largo y porque conviene que las
 * dos versiones se lean en paralelo, apartado por apartado: así se ve de
 * un vistazo si una se queda desfasada respecto a la otra.
 *
 * El original es el español y así se declara en el propio documento: en
 * caso de discrepancia, prevalece. Traducir terminología jurídica tiene
 * límites, y es mejor decirlo que fingir que no los hay.
 */
export const LEGAL = {
  es: {
    titulo: 'Aviso legal, condiciones de uso y privacidad',
    resumenEtiqueta: 'Resumen en una línea:',
    resumen: 'CleanDerApp es un tablón que pone en contacto a particulares. No participa en los servicios que se acuerden, no los supervisa y no responde de ellos ni de lo que cada usuario publique.',
    pendiente: 'Servicio en pruebas. CleanDerApp no está abierta al público y todavía no presta servicio a usuarios reales. La dirección de contacto se publicará antes de su puesta en funcionamiento.',
    prevalenciaEtiqueta: 'Versión original:',
    prevalencia: 'Este documento se redactó en español. La traducción al inglés se ofrece para facilitar su comprensión; en caso de discrepancia entre ambas versiones, prevalece la española.',
    normativaEtiqueta: 'Normativa de referencia:',
    normativa: 'Reglamento (UE) 2016/679 (RGPD); Ley Orgánica 3/2018 de Protección de Datos Personales y Garantía de los Derechos Digitales; Ley 34/2002 de Servicios de la Sociedad de la Información y de Comercio Electrónico; Reglamento (UE) 2022/2065 de Servicios Digitales; y Real Decreto Legislativo 1/2007, texto refundido de la Ley General para la Defensa de los Consumidores y Usuarios.',
    actualizadoEtiqueta: 'Última actualización:',
    contactoPendiente: 'Pendiente de publicar antes de la apertura al público.',

    secciones: [
      {
        titulo: '1. Contacto',
        parrafos: [
          'Para cualquier comunicación relativa a la Plataforma —denuncias de contenido, ejercicio de derechos sobre tus datos o cualquier incidencia— la dirección de contacto es:',
        ],
        contacto: true,
        cierre: ['En adelante, «CleanDerApp» o «la Plataforma». El uso de la Plataforma implica la aceptación de este documento en su totalidad.'],
      },
      {
        titulo: '2. Qué es CleanDerApp y qué no es',
        parrafos: [
          'CleanDerApp es un servicio de intermediación que permite a unos usuarios publicar que ofrecen un servicio doméstico y a otros publicar que lo necesitan. Cuando ambos manifiestan interés mutuo, la Plataforma les muestra sus respectivos teléfonos de contacto. Ahí termina su función.',
          'CleanDerApp, de forma expresa:',
        ],
        lista: [
          'No es parte del contrato, acuerdo o relación que surja entre usuarios.',
          'No presta servicios de limpieza, fontanería, electricidad ni ningún otro.',
          'No emplea, contrata, subcontrata ni representa a quienes ofrecen servicios. No existe relación laboral, mercantil ni de dependencia con ellos.',
          'No interviene en precios, presupuestos, cobros, pagos, facturas ni condiciones. No gestiona pagos de ningún tipo.',
          'No supervisa, dirige ni controla la ejecución de los trabajos.',
          'No verifica la identidad real, la titulación, la colegiación, la experiencia, los seguros, las altas en la Seguridad Social ni las obligaciones fiscales de ningún usuario.',
          'No garantiza la calidad, la puntualidad, la seguridad ni la legalidad de los servicios acordados.',
        ],
        cierre: ['Toda relación entre usuarios se establece directamente entre ellos y bajo su exclusiva responsabilidad, fuera de la Plataforma y sin su participación.'],
      },
      {
        titulo: '3. Contenidos publicados por los usuarios',
        parrafos: [
          'Los datos de cada perfil y anuncio —nombre, ciudad, servicio, precio, resumen, fotografía y teléfono— son aportados y publicados por el propio usuario.',
          'Cada usuario es el único y exclusivo responsable de lo que publica, y garantiza que:',
        ],
        lista: [
          'La información es veraz, exacta y está actualizada.',
          'Es titular de los derechos sobre las imágenes que sube, o cuenta con autorización, y no vulnera derechos de imagen de terceros.',
          'Cumple la normativa aplicable a la actividad que ofrece, incluidas las obligaciones fiscales, laborales y de seguridad.',
          'El contenido no es ilícito, falso, engañoso, injurioso, discriminatorio, sexual, violento ni contrario al orden público.',
        ],
        cierre: [
          'CleanDerApp no responde de los contenidos generados por los usuarios. No los elabora, no los asume como propios y no garantiza su veracidad. La Plataforma actúa como prestador de servicios de alojamiento de datos conforme al artículo 16 de la Ley 34/2002 (LSSI-CE) y al Reglamento (UE) 2022/2065 de Servicios Digitales, de modo que no responde de la información almacenada a petición de los usuarios siempre que no tenga conocimiento efectivo de su ilicitud o que, al tenerlo, actúe con diligencia para retirarla.',
        ],
      },
      {
        titulo: '4. Moderación y retirada de contenidos',
        parrafos: [
          'Los textos descriptivos y las fotografías pasan por una revisión previa antes de publicarse. Esta revisión es una medida voluntaria de buena fe y, conforme al artículo 7 del Reglamento (UE) 2022/2065, no hace que CleanDerApp asuma la autoría de los contenidos ni le priva de la exención de responsabilidad del apartado anterior. No constituye una garantía sobre la veracidad de lo publicado.',
          'Si detectas contenido ilícito, falso u ofensivo, puedes denunciarlo desde la propia aplicación, con el botón que aparece en cada perfil, o escribiendo a la dirección de contacto. Una vez tengamos conocimiento efectivo, retiraremos el contenido o bloquearemos la cuenta con la mayor brevedad posible.',
          'CleanDerApp puede suspender, ocultar o eliminar cualquier perfil o contenido, y cancelar cuentas, sin previo aviso y sin derecho a indemnización, cuando incumplan este documento o la legislación vigente.',
        ],
      },
      {
        titulo: '5. Conducta exigida a los usuarios',
        parrafos: ['Está prohibido, entre otras conductas:'],
        lista: [
          'Suplantar la identidad de otra persona o usar fotografías que no sean propias.',
          'Publicar datos de contacto de terceros sin su consentimiento.',
          'Ofrecer o solicitar servicios ilegales, o cualquier servicio de naturaleza sexual.',
          'Usar la Plataforma para acosar, amenazar, estafar o enviar publicidad no solicitada.',
          'Emplear los teléfonos obtenidos mediante un match para un fin distinto de contactar sobre el servicio, o cederlos a terceros.',
          'Ofrecer servicios sanitarios —fisioterapia, podología, enfermería y análogos— u otros oficios regulados sin la titulación, la colegiación y el seguro de responsabilidad civil que la ley exija en cada caso.',
          'Extraer datos de forma automatizada o intentar vulnerar las medidas de seguridad.',
        ],
        cierre: ['La Plataforma no comprueba titulaciones, colegiaciones, seguros ni habilitaciones: quien se anuncia responde de cumplir los requisitos de su oficio, y quien contrata puede y debe pedírselos.', 'Recomendamos adoptar las precauciones habituales al tratar con desconocidos: acordar las condiciones por escrito, desconfiar de pagos por adelantado y no facilitar datos bancarios ni documentación personal.'],
      },
      {
        titulo: '6. Limitación de responsabilidad',
        parrafos: ['En la máxima medida permitida por la ley, CleanDerApp no responde de:'],
        lista: [
          'Los daños, perjuicios, pérdidas o lesiones derivados de los servicios acordados entre usuarios, ni de su ejecución defectuosa, su retraso o su falta de ejecución.',
          'El incumplimiento de pagos entre usuarios, ni de cualquier conflicto económico entre ellos.',
          'La conducta de los usuarios, dentro o fuera de la Plataforma, incluidas las conversaciones que mantengan por WhatsApp u otros medios una vez intercambiados los teléfonos.',
          'La falsedad de los datos aportados por un usuario, ni de la falta de titulación, seguro o habilitación de quien ofrece un servicio.',
          'Las interrupciones, errores o indisponibilidad del servicio, que se presta «tal cual» y sin garantía de funcionamiento ininterrumpido.',
        ],
        cierre: [
          'Nada de lo anterior excluye la responsabilidad que legalmente no pueda excluirse, en particular la derivada de dolo o de daños causados a consumidores por causa imputable a la Plataforma.',
          'El usuario mantendrá indemne a CleanDerApp frente a reclamaciones de terceros que traigan causa de los contenidos que haya publicado o del incumplimiento de estas condiciones.',
        ],
      },
      {
        titulo: '7. Datos personales que se tratan',
        parrafos: [
          'Las consultas sobre el tratamiento de datos se atienden en la dirección de contacto del apartado 1.',
          'Se tratan los siguientes datos, todos facilitados por el usuario:',
        ],
        lista: [
          'Nombre',
          'Correo electrónico (necesario para acceder a la cuenta)',
          'Teléfono de WhatsApp',
          'Provincia y municipio',
          'Fotografía de perfil (opcional)',
          'Tipo de usuario, servicio y precio',
          'Texto descriptivo, de un máximo de 150 caracteres',
          'Intereses marcados, matches, valoraciones y denuncias enviadas',
        ],
        cierre: ['No se recogen datos de geolocalización, datos bancarios ni categorías especiales de datos.'],
      },
      {
        titulo: '8. Para qué se usan y con qué base legal',
        lista: [
          'Ejecución del contrato: crear y mantener la cuenta, mostrar el perfil a otros usuarios y facilitar el contacto cuando hay match.',
          'Interés legítimo: moderar contenidos, prevenir fraudes y abusos, y mantener la seguridad del servicio.',
          'Cumplimiento legal: atender requerimientos de autoridades competentes.',
        ],
        cierre: ['No se toman decisiones automatizadas con efectos jurídicos, ni se elaboran perfiles con fines publicitarios. No se envía publicidad.'],
      },
      {
        titulo: '9. Cómo se protege el teléfono',
        parrafos: [
          'El teléfono es el dato más sensible de la Plataforma y por eso no se publica nunca. Mientras no exista un match, el teléfono de otro usuario no llega siquiera al navegador: las tarjetas que se muestran no contienen ese dato, y la base de datos solo lo entrega cuando comprueba que ambas partes se han marcado mutuamente.',
          'A partir del match, cada parte ve el teléfono de la otra. Al aceptar estas condiciones, el usuario consiente esa comunicación de su teléfono a quien haya coincidido con él. Puede evitarla en cualquier momento ocultando su perfil, eliminando el match o eliminando su cuenta.',
        ],
      },
      {
        titulo: '10. Destinatarios y conservación',
        parrafos: [
          'Los datos se alojan en la infraestructura de Supabase, proveedor que actúa como encargado del tratamiento. No se ceden datos a terceros salvo obligación legal, y no se realizan transferencias internacionales fuera de las previstas por ese proveedor bajo garantías adecuadas.',
          'Los datos se conservan mientras la cuenta esté activa. Al eliminarla se borran la cuenta, el perfil, la fotografía, los matches y las valoraciones, salvo lo que deba conservarse para atender responsabilidades legales.',
        ],
      },
      {
        titulo: '11. Seguridad',
        parrafos: [
          'Se aplican medidas técnicas razonables: cifrado del tráfico mediante HTTPS, contraseñas almacenadas de forma cifrada e irreversible por el proveedor de autenticación, y reglas de seguridad a nivel de base de datos que limitan cada consulta a los datos que el usuario tiene derecho a ver.',
          'Ningún sistema es infalible. La Plataforma no garantiza una seguridad absoluta y el usuario es responsable de custodiar su contraseña.',
        ],
      },
      {
        titulo: '12. Derechos del usuario',
        parrafos: [
          'Supresión: puedes eliminar tu cuenta tú misma en cualquier momento, sin pedir permiso ni dar explicaciones, desde «Mi perfil». El borrado es inmediato y arrastra tu perfil, tu fotografía, tus matches y tus valoraciones.',
          'Portabilidad: desde «Mi perfil» puedes descargar en un archivo todo lo que la Plataforma guarda sobre ti.',
          'Para el resto de derechos —acceso, rectificación, oposición y limitación— escribe a la dirección de contacto indicando cuál ejercitas y acreditando tu identidad. Responderemos en el plazo de un mes.',
          'Si consideras que tus datos no se han tratado correctamente, puedes reclamar ante la Agencia Española de Protección de Datos (www.aepd.es).',
        ],
      },
      {
        titulo: '13. Menores de edad',
        parrafos: ['El servicio está dirigido exclusivamente a mayores de 18 años. No se permite el registro de menores. Si se detecta la cuenta de un menor, será eliminada.'],
      },
      {
        titulo: '14. Modificaciones',
        parrafos: ['Este documento puede actualizarse. Los cambios se publicarán en esta misma página con su fecha. El uso continuado de la Plataforma tras su publicación implica su aceptación.'],
      },
      {
        titulo: '15. Ley aplicable y jurisdicción',
        parrafos: ['Este documento se rige por la legislación española. Para cualquier controversia, las partes se someten a los juzgados y tribunales que correspondan conforme a la normativa aplicable; tratándose de consumidores, los de su domicilio.'],
      },
    ],
  },

  en: {
    titulo: 'Legal notice, terms of use and privacy',
    resumenEtiqueta: 'In one line:',
    resumen: 'CleanDerApp is a noticeboard that puts individuals in touch with each other. It takes no part in the services they agree on, does not supervise them, and is not liable for them or for what each user publishes.',
    pendiente: 'Service in testing. CleanDerApp is not open to the public and does not yet serve real users. The contact address will be published before it goes live.',
    prevalenciaEtiqueta: 'Original version:',
    prevalencia: 'This document was drafted in Spanish. The English translation is provided to aid understanding; in the event of any discrepancy between the two versions, the Spanish one prevails.',
    normativaEtiqueta: 'Applicable legislation:',
    normativa: 'Regulation (EU) 2016/679 (GDPR); Spanish Organic Law 3/2018 on Personal Data Protection and Digital Rights; Spanish Law 34/2002 on Information Society Services and Electronic Commerce; Regulation (EU) 2022/2065 (Digital Services Act); and Spanish Royal Legislative Decree 1/2007, the consolidated text of the General Law for the Defence of Consumers and Users.',
    actualizadoEtiqueta: 'Last updated:',
    contactoPendiente: 'To be published before the service opens to the public.',

    secciones: [
      {
        titulo: '1. Contact',
        parrafos: [
          'For any communication regarding the Platform —content reports, exercising your rights over your data, or any other issue— the contact address is:',
        ],
        contacto: true,
        cierre: ['Hereinafter “CleanDerApp” or “the Platform”. Using the Platform means accepting this document in full.'],
      },
      {
        titulo: '2. What CleanDerApp is and what it is not',
        parrafos: [
          'CleanDerApp is an intermediation service that lets some users publish that they offer a home service and others publish that they need one. When both express mutual interest, the Platform shows them each other’s contact phone numbers. Its role ends there.',
          'CleanDerApp expressly:',
        ],
        lista: [
          'Is not a party to any contract, agreement or relationship arising between users.',
          'Does not provide cleaning, plumbing, electrical or any other services.',
          'Does not employ, hire, subcontract or represent those who offer services. There is no employment, commercial or dependency relationship with them.',
          'Does not take part in prices, quotes, charges, payments, invoices or terms. It does not handle payments of any kind.',
          'Does not supervise, direct or control how the work is carried out.',
          'Does not verify the real identity, qualifications, professional registration, experience, insurance, social security registration or tax obligations of any user.',
          'Does not guarantee the quality, punctuality, safety or lawfulness of the services agreed.',
        ],
        cierre: ['Any relationship between users is established directly between them and under their sole responsibility, outside the Platform and without its involvement.'],
      },
      {
        titulo: '3. Content published by users',
        parrafos: [
          'The details in each profile and listing —name, town, service, price, summary, photograph and phone number— are provided and published by the user themselves.',
          'Each user is solely and exclusively responsible for what they publish, and warrants that:',
        ],
        lista: [
          'The information is truthful, accurate and up to date.',
          'They own the rights to the images they upload, or have permission, and do not infringe third parties’ image rights.',
          'They comply with the regulations applicable to the activity they offer, including tax, employment and safety obligations.',
          'The content is not unlawful, false, misleading, defamatory, discriminatory, sexual, violent or contrary to public order.',
        ],
        cierre: [
          'CleanDerApp is not liable for user-generated content. It does not create it, does not adopt it as its own and does not guarantee its accuracy. The Platform acts as a hosting service provider under article 16 of Spanish Law 34/2002 (LSSI-CE) and Regulation (EU) 2022/2065 (Digital Services Act), and is therefore not liable for information stored at users’ request provided it has no actual knowledge of its unlawfulness or, upon obtaining such knowledge, acts diligently to remove it.',
        ],
      },
      {
        titulo: '4. Moderation and removal of content',
        parrafos: [
          'Descriptive texts and photographs are reviewed before being published. This review is a voluntary good-faith measure and, under article 7 of Regulation (EU) 2022/2065, does not make CleanDerApp the author of the content nor deprive it of the exemption from liability set out above. It is not a guarantee as to the accuracy of what is published.',
          'If you come across unlawful, false or offensive content, you can report it from within the app, using the button on each profile, or by writing to the contact address. Once we have actual knowledge, we will remove the content or block the account as promptly as possible.',
          'CleanDerApp may suspend, hide or delete any profile or content, and cancel accounts, without prior notice and without any right to compensation, where they breach this document or applicable law.',
        ],
      },
      {
        titulo: '5. Conduct required of users',
        parrafos: ['The following conduct, among others, is prohibited:'],
        lista: [
          'Impersonating another person or using photographs that are not your own.',
          'Publishing third parties’ contact details without their consent.',
          'Offering or requesting unlawful services, or any service of a sexual nature.',
          'Using the Platform to harass, threaten, defraud or send unsolicited advertising.',
          'Using phone numbers obtained through a match for any purpose other than discussing the service, or passing them on to third parties.',
          'Offering healthcare services — physiotherapy, chiropody, nursing and the like — or other regulated occupations without the qualifications, professional registration and liability insurance required by law in each case.',
          'Extracting data by automated means or attempting to circumvent security measures.',
        ],
        cierre: ['The Platform does not verify qualifications, professional registration, insurance or authorisations: whoever advertises is responsible for meeting the requirements of their occupation, and whoever hires may and should ask for them.', 'We recommend taking the usual precautions when dealing with strangers: agree terms in writing, be wary of upfront payments, and do not share bank details or personal documents.'],
      },
      {
        titulo: '6. Limitation of liability',
        parrafos: ['To the fullest extent permitted by law, CleanDerApp is not liable for:'],
        lista: [
          'Damage, loss or injury arising from services agreed between users, nor from their defective performance, delay or non-performance.',
          'Failure to pay between users, nor any financial dispute between them.',
          'Users’ conduct, on or off the Platform, including conversations held over WhatsApp or other means once phone numbers have been exchanged.',
          'The falsity of data provided by a user, nor the lack of qualifications, insurance or authorisation of anyone offering a service.',
          'Interruptions, errors or unavailability of the service, which is provided “as is” and without any guarantee of uninterrupted operation.',
        ],
        cierre: [
          'None of the above excludes liability that cannot lawfully be excluded, in particular liability arising from wilful misconduct or from harm caused to consumers through the Platform’s fault.',
          'Users shall indemnify CleanDerApp against third-party claims arising from the content they have published or from breach of these terms.',
        ],
      },
      {
        titulo: '7. Personal data processed',
        parrafos: [
          'Queries about data processing are handled at the contact address in section 1.',
          'The following data are processed, all provided by the user:',
        ],
        lista: [
          'Name',
          'Email address (needed to access the account)',
          'WhatsApp phone number',
          'Province and town',
          'Profile photograph (optional)',
          'User type, service and price',
          'Descriptive text, up to 150 characters',
          'Interests marked, matches, ratings and reports sent',
        ],
        cierre: ['No location data, bank details or special categories of data are collected.'],
      },
      {
        titulo: '8. Purposes and legal basis',
        lista: [
          'Performance of the contract: creating and maintaining the account, showing the profile to other users and enabling contact when there is a match.',
          'Legitimate interest: moderating content, preventing fraud and abuse, and keeping the service secure.',
          'Legal compliance: responding to requests from competent authorities.',
        ],
        cierre: ['No automated decisions with legal effects are made, and no profiling for advertising purposes is carried out. No advertising is sent.'],
      },
      {
        titulo: '9. How phone numbers are protected',
        parrafos: [
          'The phone number is the most sensitive piece of data on the Platform and is therefore never published. Until a match exists, another user’s phone number does not even reach the browser: the cards shown do not contain it, and the database only releases it once it has verified that both parties have picked each other.',
          'From the match onwards, each party sees the other’s number. By accepting these terms, the user consents to their phone number being disclosed to whoever has matched with them. They can prevent this at any time by hiding their profile, removing the match or deleting their account.',
        ],
      },
      {
        titulo: '10. Recipients and retention',
        parrafos: [
          'Data are hosted on Supabase’s infrastructure, which acts as data processor. No data are shared with third parties except where legally required, and no international transfers take place beyond those made by that provider under appropriate safeguards.',
          'Data are kept while the account is active. On deletion, the account, profile, photograph, matches and ratings are removed, except for anything that must be retained to meet legal responsibilities.',
        ],
      },
      {
        titulo: '11. Security',
        parrafos: [
          'Reasonable technical measures are in place: traffic encrypted over HTTPS, passwords stored in encrypted and irreversible form by the authentication provider, and database-level security rules that limit every query to the data the user is entitled to see.',
          'No system is infallible. The Platform does not guarantee absolute security and users are responsible for safeguarding their password.',
        ],
      },
      {
        titulo: '12. User rights',
        parrafos: [
          'Erasure: you can delete your account yourself at any time, without asking permission or giving reasons, from “My profile”. Deletion is immediate and takes with it your profile, photograph, matches and ratings.',
          'Portability: from “My profile” you can download a file containing everything the Platform holds about you.',
          'For the remaining rights —access, rectification, objection and restriction— write to the contact address stating which one you are exercising and proving your identity. We will reply within one month.',
          'If you believe your data have not been handled properly, you may complain to the Spanish Data Protection Agency (www.aepd.es).',
        ],
      },
      {
        titulo: '13. Minors',
        parrafos: ['The service is intended exclusively for people over 18. Minors may not register. If an account belonging to a minor is detected, it will be deleted.'],
      },
      {
        titulo: '14. Changes',
        parrafos: ['This document may be updated. Changes will be published on this same page along with their date. Continued use of the Platform after publication implies acceptance.'],
      },
      {
        titulo: '15. Governing law and jurisdiction',
        parrafos: ['This document is governed by Spanish law. For any dispute, the parties submit to the courts having jurisdiction under applicable law; for consumers, those of their place of residence.'],
      },
    ],
  },
}
