import "./ContentPanel.css";
import VentaForm from "./VentaForm";
import PagoForm from "./PagoForm";
import GastoForm from "./GastoForm";
import DeudasPanel from "./DeudasPanel";
import ClientesPanel from "./ClientesPanel";
import VentasList from "./VentasList";
import PagosList from "./PagosList";
import GastosList from "./GastosList";

function ContentPanel({
  activeSection,
  selectedCliente,
  setSelectedCliente,
  setActiveSection
}) {

  switch (activeSection) {

    case "venta":
      return <VentaForm />;

    case "pago":
      return (
        <PagoForm
          selectedCliente={selectedCliente}
        />
      );

    case "gasto":
      return <GastoForm />;

    case "deuda":
      return (
        <DeudasPanel
          setSelectedCliente={setSelectedCliente}
          setActiveSection={setActiveSection}
        />
      );

      case "clientes":
        return <ClientesPanel />;

      case "verVentas":
        return <VentasList />;

      case "verPagos":
        return <PagosList />;

      case "verGastos":
        return <GastosList />;

    default:
      return <h4>Selecciona una opción</h4>;
  }
}

export default ContentPanel;