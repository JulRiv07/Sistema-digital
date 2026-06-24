import "./Header.css";
import Logo from "../assets/Logo.png";
import { useAuth } from "../context/AuthContext";

function Header() {
  const { usuario, cerrarSesion } = useAuth();

  return (
    <header className="header">
      <img src={Logo} alt="Logo" className="header-logo" />
      <h1 className="header-title"> POSTRES JULI </h1>

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
