export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <p>© {currentYear} Cleander. Todos los derechos reservados a <strong>@Isabel Simón</strong></p>
        <div className="footer-links">
          <a href="#privacidad">Privacidad</a>
          <span className="separator">•</span>
          <a href="#terminos">Términos de Servicio</a>
          <span className="separator">•</span>
          <a href="#contacto">Contacto</a>
        </div>
      </div>
    </footer>
  );
}
