import "./Footer.css";
import { useAuth } from "../context/AuthContext";

const EMPRESA_PRINCIPAL = "Postres Juli";

function Footer() {
  const { usuario } = useAuth();

  const empresaNombre = usuario?.empresa_nombre || "Sistema Digital";
  const esPrincipal = empresaNombre === EMPRESA_PRINCIPAL;
  const anio = new Date().getFullYear();

  return (
    <footer className="footer">
      {esPrincipal ? (
        <p>
          © JRS <br />
          {anio} Postres Juli - Sistema de Gestión <br />
          Te amo ma ❤️
        </p>
      ) : (
        <p>
          {empresaNombre} <br />
          {anio} · Powered by Sistema Digital
        </p>
      )}
    </footer>
  );
}

export default Footer;
