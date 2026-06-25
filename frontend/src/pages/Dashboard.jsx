import "./Dashboard.css";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import PeriodSelector from "../components/PeriodSelector";
import SummaryCards from "../components/SummaryCards";
import Sidebar from "../components/Sidebar";
import ContentPanel from "../components/ContentPanel";
import Footer from "../components/Footer";

function Dashboard() {

  const { usuario } = useAuth();
  const puedeOperar = usuario?.rol === "empleado" || usuario?.rol === "propietaria";
  const seccionInicial = puedeOperar ? "venta" : "estadisticas";
  const tema = usuario?.empresa_tema || "rosa";

  const ahora = new Date();
  const [periodo, setPeriodo] = useState({
    mes: ahora.getMonth() + 1,
    año: ahora.getFullYear(),
  });

  const [activeSection, setActiveSection] = useState(seccionInicial);
  const [selectedCliente, setSelectedCliente] = useState(null);

  return (
    <div className={`dashboard-container tema-${tema}`}>
      <Header />

      <PeriodSelector periodo={periodo} setPeriodo={setPeriodo} />
      <SummaryCards key={activeSection} periodo={periodo} />

      <div className="main-area">
        <Sidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />

        <ContentPanel
          activeSection={activeSection}
          selectedCliente={selectedCliente}
          setSelectedCliente={setSelectedCliente}
          setActiveSection={setActiveSection}
          periodo={periodo}
        />
      </div>

      <Footer />
    </div>
  );
}

export default Dashboard;