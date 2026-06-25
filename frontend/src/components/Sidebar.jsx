import "./Sidebar.css";
import { useAuth } from "../context/AuthContext";

import plus from "../assets/icons/plus.png";
import coin from "../assets/icons/coin.png";
import happyFace from "../assets/icons/sad_face.png";
import bravoIcon from "../assets/icons/angry.png";
import accounting from "../assets/icons/hand.png";
import cliente from "../assets/icons/cliente.png";
import memo from "../assets/icons/memo.png";
import money from "../assets/icons/money.png";
import saving from "../assets/icons/saving.png";

function Sidebar({ activeSection, setActiveSection }) {

  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === "admin";

  const Boton = ({ seccion, icono, children, iconoActivo }) => (
    <button
      className={`sidebar-button ${activeSection === seccion ? "active" : ""}`}
      onClick={() => setActiveSection(seccion)}
    >
      <img
        src={iconoActivo && activeSection === seccion ? iconoActivo : icono}
        className="button-icon"
      />
      {children}
    </button>
  );

  return (
    <div className="sidebar">

      {/* Operación: solo empleados */}
      {!esAdmin && (
        <>
          <Boton seccion="venta" icono={plus}>Ingresar venta</Boton>
          <Boton seccion="pago" icono={coin}>Ingresar pago</Boton>
          <Boton seccion="deuda" icono={accounting}>Deudas actuales</Boton>
        </>
      )}

      {/* Gastos: solo empresario */}
      {esAdmin && (
        <Boton seccion="gasto" icono={happyFace} iconoActivo={bravoIcon}>
          Ingresar gasto
        </Boton>
      )}

      {/* Comunes a los dos roles */}
      <Boton seccion="clientes" icono={cliente}>Clientes</Boton>
      <Boton seccion="verVentas" icono={memo}>Ver ventas</Boton>
      <Boton seccion="verPagos" icono={money}>Ver pagos</Boton>
      <Boton seccion="verGastos" icono={saving}>Ver gastos</Boton>

      {/* Solo empresario */}
      {esAdmin && (
        <>
          <Boton seccion="estadisticas" icono={memo}>Estadísticas</Boton>
          <Boton seccion="admin" icono={cliente}>Administración</Boton>
        </>
      )}

      <Boton seccion="perfil" icono={cliente}>Mi perfil</Boton>

    </div>
  );
}

export default Sidebar;
