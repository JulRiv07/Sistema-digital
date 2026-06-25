import "./Dashboard.css";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import SummaryCards from "../components/SummaryCards";
import Sidebar from "../components/Sidebar";
import ContentPanel from "../components/ContentPanel";
import Footer from "../components/Footer";

function Dashboard() {

  const { usuario } = useAuth();
  const seccionInicial = usuario?.rol === "admin" ? "estadisticas" : "venta";

  const [activeSection, setActiveSection] = useState(seccionInicial);
  const [selectedCliente, setSelectedCliente] = useState(null);

  return (
    <div className="dashboard-container">
      <Header />

      <SummaryCards key={activeSection} />

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
        />
      </div>

      <Footer />
    </div>
  );
}

export default Dashboard;