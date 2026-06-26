import "./Header.css";
import Logo from "../assets/Logo.png";
import { useAuth } from "../context/AuthContext";

// Empresa principal (la de tu mamá): solo esta muestra el logo de Postres Juli.
const EMPRESA_PRINCIPAL = "Postres Juli";

function Header() {
  const { usuario, cerrarSesion } = useAuth();

  const empresaNombre = usuario?.empresa_nombre || "Controla";
  const esPrincipal = empresaNombre === EMPRESA_PRINCIPAL;
  const logoEmpresa = usuario?.empresa_logo;

  return (
    <header className="header">
      <div className="header-app">
        <img src="/controla.svg" alt="Controla" className="header-app-logo" />
        <span className="header-app-name">Controla</span>
      </div>

      <div className="header-brand">
        {logoEmpresa ? (
          <img src={logoEmpresa} alt="Logo" className="header-logo" />
        ) : esPrincipal ? (
          <img src={Logo} alt="Logo" className="header-logo" />
        ) : null}
        <h1 className="header-title">{empresaNombre}</h1>
      </div>

      <div className="header-user">
        {usuario && <span className="header-username">{usuario.nombre}</span>}
        <button className="header-logout" onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}

export default Header;
