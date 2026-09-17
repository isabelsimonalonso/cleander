import Footer from '../components/Footer'
import '../styles/privacy.css'

export default function Privacy() {
  return (
    <div className="privacy-container">
      <div className="privacy-content">
        <h1>Política de Privacidad y Protección de Datos</h1>

        <section>
          <h2>1. Responsable del Tratamiento</h2>
          <p>
            <strong>Cleander</strong> (en adelante, "la Aplicación")
            es responsable del tratamiento de datos personales conforme a la Ley Orgánica 3/2018 de Protección de Datos
            Personales y Garantía de Derechos Digitales (LOPD) y el Reglamento (UE) 2016/679 (GDPR).
          </p>
        </section>

        <section>
          <h2>2. Datos Personales Recopilados</h2>
          <p>La Aplicación recopila los siguientes datos personales:</p>
          <ul>
            <li>Nombre completo</li>
            <li>Email (verificado)</li>
            <li>Teléfono (verificado)</li>
            <li>Foto de perfil (verificada por administrador)</li>
            <li>Tipo de usuario (Cliente/Profesional)</li>
            <li>Datos de ubicación (opcional)</li>
            <li>Historial de servicios y transacciones</li>
            <li>Valoraciones y reseñas</li>
          </ul>
        </section>

        <section>
          <h2>3. Base Jurídica del Tratamiento</h2>
          <p>El tratamiento de datos se realiza bajo los siguientes fundamentos:</p>
          <ul>
            <li><strong>Consentimiento del usuario:</strong> Otorgado en el registro</li>
            <li><strong>Ejecución del contrato:</strong> Prestación del servicio de marketplace</li>
            <li><strong>Cumplimiento legal:</strong> Obligaciones fiscales y de prevención de fraude</li>
            <li><strong>Interés legítimo:</strong> Mejora de la Aplicación y seguridad</li>
          </ul>
        </section>

        <section>
          <h2>4. Propósito del Tratamiento</h2>
          <p>Los datos se utilizan para:</p>
          <ul>
            <li>Gestionar la cuenta de usuario y acceso a la Aplicación</li>
            <li>Facilitar matches entre clientes y profesionales</li>
            <li>Verificar identidad y prevenir fraude</li>
            <li>Enviar notificaciones sobre matches y servicios</li>
            <li>Cumplir obligaciones fiscales y legales</li>
            <li>Mejorar la experiencia de usuario y seguridad</li>
            <li>Análisis estadísticos y mejora del servicio</li>
          </ul>
        </section>

        <section>
          <h2>5. Almacenamiento y Seguridad</h2>
          <p>
            Los datos personales se almacenan en servidores seguros con encriptación end-to-end.
            Se implementan medidas técnicas y organizativas de seguridad según GDPR, incluyendo:
          </p>
          <ul>
            <li>Encriptación de datos en tránsito y en reposo</li>
            <li>Control de acceso mediante autenticación JWT</li>
            <li>Auditoría completa de acciones administrativas</li>
            <li>Cumplimiento de derechos ARCO (Acceso, Rectificación, Cancelación, Oposición)</li>
          </ul>
        </section>

        <section>
          <h2>6. Derechos de los Usuarios - GDPR</h2>
          <p>Conforme al GDPR, los usuarios tienen derecho a:</p>
          <ul>
            <li><strong>Acceso:</strong> Solicitar copia de sus datos personales</li>
            <li><strong>Rectificación:</strong> Corregir datos inexactos</li>
            <li><strong>Cancelación (Derecho al olvido):</strong> Solicitar eliminación completa de datos</li>
            <li><strong>Oposición:</strong> Rechazar tratamiento de datos para ciertos fines</li>
            <li><strong>Portabilidad:</strong> Descargar sus datos en formato estructurado</li>
            <li><strong>Restricción:</strong> Limitar el procesamiento de datos</li>
          </ul>
          <p>
            Para ejercer estos derechos, contactar a: <strong>contact@cleander.app</strong>
          </p>
        </section>

        <section>
          <h2>7. Compartición de Datos</h2>
          <p>
            Los datos NO se compartirán con terceros excepto:
          </p>
          <ul>
            <li>Entre usuarios matched (contacto directo - teléfono/email)</li>
            <li>Autoridades públicas si lo requiere la ley</li>
            <li>Proveedores de servicios esenciales (servidores, análisis)</li>
          </ul>
        </section>

        <section>
          <h2>8. Retención de Datos</h2>
          <p>
            Los datos se conservarán mientras la cuenta esté activa. Al solicitar cancelación de cuenta,
            los datos se eliminarán en 30 días, salvo obligaciones legales que requieran conservarlos.
          </p>
        </section>

        <section>
          <h2>9. Consentimiento para Marketing</h2>
          <p>
            El envío de promociones requiere consentimiento explícito. Los usuarios pueden:
          </p>
          <ul>
            <li>Aceptar/rechazar marketing en el perfil</li>
            <li>Desuscribirse en cualquier momento</li>
            <li>Controlar qué datos se usan para análisis</li>
          </ul>
        </section>

        <section>
          <h2>10. Verificación de Identidad</h2>
          <p>
            Para garantizar confianza y seguridad:
          </p>
          <ul>
            <li>La foto de perfil es OBLIGATORIA y requiere aprobación del administrador</li>
            <li>Email y teléfono deben ser verificados con código de 6 dígitos</li>
            <li>Solo perfiles verificados aparecen en búsquedas</li>
            <li>Los administradores pueden bloquear usuarios por incumplimiento de normas</li>
          </ul>
        </section>

        <section>
          <h2>11. Bloqueo y Suspensión de Usuarios</h2>
          <p>
            La administración se reserva el derecho a:
          </p>
          <ul>
            <li>Bloquear usuarios por violación de términos</li>
            <li>Eliminar usuarios tras investigación (Derecho al olvido - GDPR)</li>
            <li>Mantener registro de auditoría de acciones administrativas</li>
          </ul>
        </section>

        <section>
          <h2>12. Cambios en la Política</h2>
          <p>
            Esta política puede ser actualizada ocasionalmente. Los cambios se comunicarán
            mediante notificación en la Aplicación. El uso continuado implica aceptación de cambios.
          </p>
        </section>

        <section>
          <h2>13. Contacto para Privacidad</h2>
          <p>
            Para consultas sobre privacidad y ejercer derechos GDPR:
          </p>
          <p>
            <strong>Email:</strong> contact@cleander.app<br/>
            <strong>Respuesta garantizada:</strong> 30 días hábiles (conforme a GDPR)
          </p>
        </section>

        <section className="legal-notice">
          <p>
            <strong>Aviso Legal:</strong> Esta Política de Privacidad cumple con la Ley Orgánica 3/2018 (LOPD),
            el GDPR (Reglamento 2016/679), la Ley 34/1988 de Publicidad, y la Ley 34/1988 de Servicios de la Sociedad
            de la Información y de Comercio Electrónico (LSSI-CE).
          </p>
          <p>
            <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-ES')}
          </p>
        </section>
      </div>
    </div>
  )
}
