import { Link } from 'react-router-dom'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-content">
        <p>© {currentYear} Cleander. Todos los derechos reservados.</p>
        <div className="footer-links">
          <Link to="/privacidad">Privacidad</Link>
        </div>
      </div>
    </footer>
  )
}
