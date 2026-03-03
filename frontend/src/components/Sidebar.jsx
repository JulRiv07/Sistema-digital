import "./Sidebar.css";

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

  return (
    <div className="sidebar">

      <button
        className={`sidebar-button ${activeSection === "venta" ? "active" : ""}`}
        onClick={() => setActiveSection("venta")}
      >
        <img src={plus} className="button-icon" />
        Ingresar venta
      </button>

      <button
        className={`sidebar-button ${activeSection === "pago" ? "active" : ""}`}
        onClick={() => setActiveSection("pago")}
      >
        <img src={coin} className="button-icon" />
        Ingresar pago
      </button>

      <button
        className={`sidebar-button ${activeSection === "gasto" ? "active" : ""}`}
        onClick={() => setActiveSection("gasto")}
      >
        <img
          src={activeSection === "gasto" ? bravoIcon : happyFace}
          className="button-icon"
        />
        Ingresar gasto
      </button>

      <button
        className={`sidebar-button ${activeSection === "deuda" ? "active" : ""}`}
        onClick={() => setActiveSection("deuda")}
      >
        <img src={accounting} className="button-icon" />
        Deudas actuales
      </button>

      <button
        className={`sidebar-button ${activeSection === "clientes" ? "active" : ""}`}
        onClick={() => setActiveSection("clientes")}
      >
        <img src={cliente} className="button-icon" />
        Clientes
      </button>


      <button
        className="sidebar-button"
        onClick={() => setActiveSection("verVentas")}
      >
        <img src={memo} className="button-icon" />
        Ver ventas
      </button>

      <button
        className="sidebar-button"
        onClick={() => setActiveSection("verPagos")}
      >
        <img src={money} className="button-icon" />
        Ver pagos
      </button>

      <button
        className="sidebar-button"
        onClick={() => setActiveSection("verGastos")}
      >
        <img src={saving} className="button-icon" />
        Ver gastos
      </button>

    </div>
  );
}

export default Sidebar;