import "./Footer.css";
import Logo from "../assets/Logo.png";

function Footer() {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} Postres Juli - Sistema de Gestión</p>
    </footer>
  );
}

export default Footer;