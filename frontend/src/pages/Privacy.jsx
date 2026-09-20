import '../styles/privacy.css'

/**
 * Aviso legal, condiciones de uso y política de privacidad.
 *
 * Basta con cambiar esta línea por el correo real. Mientras siga entre
 * corchetes, la página avisa de que el servicio está en pruebas.
 */
const CONTACTO = 'info@cleanderapp.com'

const PENDIENTE = CONTACTO.startsWith('[')

export default function Privacy() {
  const hoy = new Date().toLocaleDateString('es-ES')

  return (
    <div className="privacy-container">
      <div className="privacy-content">
        <h1>Aviso legal, condiciones de uso y privacidad</h1>

        {PENDIENTE && (
          <section className="aviso-pendiente">
            <p>
              <strong>Servicio en pruebas.</strong> CleanDerApp no está abierta al público
              y todavía no presta servicio a usuarios reales. La dirección de contacto
              se publicará antes de su puesta en funcionamiento.
            </p>
          </section>
        )}

        <section className="aviso-destacado">
          <p>
            <strong>Resumen en una línea:</strong> CleanDerApp es un tablón que pone en
            contacto a particulares. No participa en los servicios que se acuerden, no
            los supervisa y no responde de ellos ni de lo que cada usuario publique.
          </p>
        </section>

        <section>
          <h2>1. Contacto</h2>
          <p>
            Para cualquier comunicación relativa a la Plataforma —denuncias de
            contenido, ejercicio de derechos sobre tus datos o cualquier incidencia—
            la dirección de contacto es:
          </p>
          {PENDIENTE ? (
            <p className="tenue-legal">
              Pendiente de publicar antes de la apertura al público.
            </p>
          ) : (
            <p><strong>{CONTACTO}</strong></p>
          )}
          <p>
            En adelante, «CleanDerApp» o «la Plataforma». El uso de la Plataforma implica
            la aceptación de este documento en su totalidad.
          </p>
        </section>

        <section>
          <h2>2. Qué es CleanDerApp y qué no es</h2>
          <p>
            CleanDerApp es un <strong>servicio de intermediación</strong> que permite a unos
            usuarios publicar que ofrecen un servicio doméstico y a otros publicar que lo
            necesitan. Cuando ambos manifiestan interés mutuo, la Plataforma les muestra
            sus respectivos teléfonos de contacto. Ahí termina su función.
          </p>
          <p>CleanDerApp, de forma expresa:</p>
          <ul>
            <li><strong>No es parte</strong> del contrato, acuerdo o relación que surja entre usuarios.</li>
            <li><strong>No presta</strong> servicios de limpieza, fontanería, electricidad ni ningún otro.</li>
            <li><strong>No emplea, contrata, subcontrata ni representa</strong> a quienes ofrecen servicios. No existe relación laboral, mercantil ni de dependencia con ellos.</li>
            <li><strong>No interviene</strong> en precios, presupuestos, cobros, pagos, facturas ni condiciones. No gestiona pagos de ningún tipo.</li>
            <li><strong>No supervisa, dirige ni controla</strong> la ejecución de los trabajos.</li>
            <li><strong>No verifica</strong> la identidad real, la titulación, la colegiación, la experiencia, los seguros, las altas en la Seguridad Social ni las obligaciones fiscales de ningún usuario.</li>
            <li><strong>No garantiza</strong> la calidad, la puntualidad, la seguridad ni la legalidad de los servicios acordados.</li>
          </ul>
          <p>
            Toda relación entre usuarios se establece <strong>directamente entre ellos y bajo su
            exclusiva responsabilidad</strong>, fuera de la Plataforma y sin su participación.
          </p>
        </section>

        <section>
          <h2>3. Contenidos publicados por los usuarios</h2>
          <p>
            Los datos de cada perfil y anuncio —nombre, ciudad, servicio, precio, resumen,
            fotografía y teléfono— son <strong>aportados y publicados por el propio usuario</strong>.
          </p>
          <p>
            Cada usuario es el <strong>único y exclusivo responsable</strong> de lo que publica,
            y garantiza que:
          </p>
          <ul>
            <li>La información es veraz, exacta y está actualizada.</li>
            <li>Es titular de los derechos sobre las imágenes que sube, o cuenta con autorización, y no vulnera derechos de imagen de terceros.</li>
            <li>Cumple la normativa aplicable a la actividad que ofrece, incluidas las obligaciones fiscales, laborales y de seguridad.</li>
            <li>El contenido no es ilícito, falso, engañoso, injurioso, discriminatorio, sexual, violento ni contrario al orden público.</li>
          </ul>
          <p>
            <strong>CleanDerApp no responde de los contenidos generados por los usuarios.</strong> No
            los elabora, no los asume como propios y no garantiza su veracidad. La
            Plataforma actúa como prestador de servicios de alojamiento de datos conforme
            al <strong>artículo 16 de la Ley 34/2002 (LSSI-CE)</strong> y al{' '}
            <strong>Reglamento (UE) 2022/2065 de Servicios Digitales</strong>, de modo que no
            responde de la información almacenada a petición de los usuarios siempre que no
            tenga conocimiento efectivo de su ilicitud o que, al tenerlo, actúe con
            diligencia para retirarla.
          </p>
        </section>

        <section>
          <h2>4. Moderación y retirada de contenidos</h2>
          <p>
            Los textos descriptivos pasan por una <strong>revisión previa</strong> antes de
            publicarse. Esta revisión es una medida voluntaria de buena fe y, conforme al
            artículo 7 del Reglamento (UE) 2022/2065, <strong>no hace que CleanDerApp asuma la
            autoría de los contenidos</strong> ni le priva de la exención de responsabilidad del
            apartado anterior. No constituye una garantía sobre la veracidad de lo publicado.
          </p>
          <p>
            Si detectas contenido ilícito, falso u ofensivo, comunícalo a{' '}
            <strong>{CONTACTO}</strong> indicando el perfil afectado y el motivo. Una vez
            tengamos conocimiento efectivo, retiraremos el contenido o bloquearemos la
            cuenta con la mayor brevedad posible.
          </p>
          <p>
            CleanDerApp puede suspender, ocultar o eliminar cualquier perfil o contenido, y
            cancelar cuentas, sin previo aviso y sin derecho a indemnización, cuando
            incumplan este documento o la legislación vigente.
          </p>
        </section>

        <section>
          <h2>5. Conducta exigida a los usuarios</h2>
          <p>Está prohibido, entre otras conductas:</p>
          <ul>
            <li>Suplantar la identidad de otra persona o usar fotografías que no sean propias.</li>
            <li>Publicar datos de contacto de terceros sin su consentimiento.</li>
            <li>Ofrecer o solicitar servicios ilegales, o cualquier servicio de naturaleza sexual.</li>
            <li>Usar la Plataforma para acosar, amenazar, estafar o enviar publicidad no solicitada.</li>
            <li>Emplear los teléfonos obtenidos mediante un match para un fin distinto de contactar sobre el servicio, o cederlos a terceros.</li>
            <li>Extraer datos de forma automatizada o intentar vulnerar las medidas de seguridad.</li>
          </ul>
          <p>
            Recomendamos adoptar las precauciones habituales al tratar con desconocidos:
            acordar las condiciones por escrito, desconfiar de pagos por adelantado y no
            facilitar datos bancarios ni documentación personal.
          </p>
        </section>

        <section>
          <h2>6. Limitación de responsabilidad</h2>
          <p>En la máxima medida permitida por la ley, CleanDerApp no responde de:</p>
          <ul>
            <li>Los daños, perjuicios, pérdidas o lesiones derivados de los servicios acordados entre usuarios, ni de su ejecución defectuosa, su retraso o su falta de ejecución.</li>
            <li>El incumplimiento de pagos entre usuarios, ni de cualquier conflicto económico entre ellos.</li>
            <li>La conducta de los usuarios, dentro o fuera de la Plataforma, incluidas las conversaciones que mantengan por WhatsApp u otros medios una vez intercambiados los teléfonos.</li>
            <li>La falsedad de los datos aportados por un usuario, ni de la falta de titulación, seguro o habilitación de quien ofrece un servicio.</li>
            <li>Las interrupciones, errores o indisponibilidad del servicio, que se presta «tal cual» y sin garantía de funcionamiento ininterrumpido.</li>
          </ul>
          <p>
            Nada de lo anterior excluye la responsabilidad que legalmente no pueda
            excluirse, en particular la derivada de dolo o de daños causados a consumidores
            por causa imputable a la Plataforma.
          </p>
          <p>
            El usuario mantendrá indemne a CleanDerApp frente a reclamaciones de terceros
            que traigan causa de los contenidos que haya publicado o del incumplimiento de
            estas condiciones.
          </p>
        </section>

        <section>
          <h2>7. Datos personales que se tratan</h2>
          <p>
            Las consultas sobre el tratamiento de datos se atienden en la dirección de
            contacto del apartado 1.
          </p>
          <p>Se tratan los siguientes datos, todos facilitados por el usuario:</p>
          <ul>
            <li>Nombre</li>
            <li>Correo electrónico (necesario para acceder a la cuenta)</li>
            <li>Teléfono de WhatsApp</li>
            <li>Ciudad o localidad</li>
            <li>Fotografía de perfil (opcional)</li>
            <li>Tipo de usuario, servicio y precio por hora</li>
            <li>Texto descriptivo, de un máximo de 150 caracteres</li>
            <li>Intereses marcados, matches y valoraciones</li>
          </ul>
          <p>
            <strong>No se recogen</strong> datos de geolocalización, datos bancarios ni
            categorías especiales de datos.
          </p>
        </section>

        <section>
          <h2>8. Para qué se usan y con qué base legal</h2>
          <ul>
            <li><strong>Ejecución del contrato:</strong> crear y mantener la cuenta, mostrar el perfil a otros usuarios y facilitar el contacto cuando hay match.</li>
            <li><strong>Interés legítimo:</strong> moderar contenidos, prevenir fraudes y abusos, y mantener la seguridad del servicio.</li>
            <li><strong>Cumplimiento legal:</strong> atender requerimientos de autoridades competentes.</li>
          </ul>
          <p>
            No se toman decisiones automatizadas con efectos jurídicos, ni se elaboran
            perfiles con fines publicitarios. No se envía publicidad.
          </p>
        </section>

        <section>
          <h2>9. Cómo se protege el teléfono</h2>
          <p>
            El teléfono es el dato más sensible de la Plataforma y por eso no se publica
            nunca. Mientras no exista un match, <strong>el teléfono de otro usuario no llega
            siquiera al navegador</strong>: las tarjetas que se muestran no contienen ese dato, y
            la base de datos solo lo entrega cuando comprueba que ambas partes se han
            marcado mutuamente.
          </p>
          <p>
            A partir del match, cada parte ve el teléfono de la otra. Al aceptar estas
            condiciones, el usuario <strong>consiente esa comunicación de su teléfono</strong> a
            quien haya coincidido con él. Puede evitarla en cualquier momento ocultando su
            perfil desde «Mi perfil» o eliminando su cuenta.
          </p>
        </section>

        <section>
          <h2>10. Destinatarios y conservación</h2>
          <p>
            Los datos se alojan en la infraestructura de <strong>Supabase</strong>, proveedor que
            actúa como encargado del tratamiento. No se ceden datos a terceros salvo
            obligación legal, y no se realizan transferencias internacionales fuera de las
            previstas por ese proveedor bajo garantías adecuadas.
          </p>
          <p>
            Los datos se conservan mientras la cuenta esté activa. Al solicitar su
            eliminación se borran la cuenta, el perfil, los matches y las valoraciones,
            salvo los que deban conservarse para atender responsabilidades legales.
          </p>
        </section>

        <section>
          <h2>11. Seguridad</h2>
          <p>
            Se aplican medidas técnicas razonables: cifrado del tráfico mediante HTTPS,
            contraseñas almacenadas de forma cifrada e irreversible por el proveedor de
            autenticación, y reglas de seguridad a nivel de base de datos que limitan cada
            consulta a los datos que el usuario tiene derecho a ver.
          </p>
          <p>
            Ningún sistema es infalible. La Plataforma no garantiza una seguridad absoluta
            y el usuario es responsable de custodiar su contraseña.
          </p>
        </section>

        <section>
          <h2>12. Derechos del usuario</h2>
          <p>
            Puedes ejercer los derechos de acceso, rectificación, supresión, oposición,
            limitación y portabilidad escribiendo a <strong>{CONTACTO}</strong>, indicando el
            derecho que ejercitas y acreditando tu identidad. Responderemos en el plazo de
            un mes.
          </p>
          <p>
            Si consideras que tus datos no se han tratado correctamente, puedes reclamar
            ante la <strong>Agencia Española de Protección de Datos</strong> (www.aepd.es).
          </p>
        </section>

        <section>
          <h2>13. Menores de edad</h2>
          <p>
            El servicio está dirigido exclusivamente a mayores de 18 años. No se permite el
            registro de menores. Si se detecta la cuenta de un menor, será eliminada.
          </p>
        </section>

        <section>
          <h2>14. Modificaciones</h2>
          <p>
            Este documento puede actualizarse. Los cambios se publicarán en esta misma
            página con su fecha. El uso continuado de la Plataforma tras su publicación
            implica su aceptación.
          </p>
        </section>

        <section>
          <h2>15. Ley aplicable y jurisdicción</h2>
          <p>
            Este documento se rige por la legislación española. Para cualquier controversia,
            las partes se someten a los juzgados y tribunales que correspondan conforme a la
            normativa aplicable; tratándose de consumidores, los de su domicilio.
          </p>
        </section>

        <section className="legal-notice">
          <p>
            <strong>Normativa de referencia:</strong> Reglamento (UE) 2016/679 (RGPD);
            Ley Orgánica 3/2018 de Protección de Datos Personales y Garantía de los Derechos
            Digitales; Ley 34/2002 de Servicios de la Sociedad de la Información y de
            Comercio Electrónico; Reglamento (UE) 2022/2065 de Servicios Digitales; y Real
            Decreto Legislativo 1/2007, texto refundido de la Ley General para la Defensa de
            los Consumidores y Usuarios.
          </p>
          <p>
            <strong>Última actualización:</strong> {hoy}
          </p>
        </section>
      </div>
    </div>
  )
}
