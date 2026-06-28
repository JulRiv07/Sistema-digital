import "./ContentPanel.css";
import VentaForm from "./VentaForm";
import PagoForm from "./PagoForm";
import GastoForm from "./GastoForm";
import DeudasPanel from "./DeudasPanel";
import ClientesPanel from "./ClientesPanel";
import VentasList from "./VentasList";
import GastosList from "./GastosList";
import AdminPanel from "./AdminPanel";
import PerfilPanel from "./PerfilPanel";
import EstadisticasEmpresa from "./EstadisticasEmpresa";
import Inventario from "./Inventario";
import ProductosView from "./ProductosView";

function ContentPanel({
  activeSection,
  selectedCliente,
  setSelectedCliente,
  setActiveSection,
  periodo
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

      case "verGastos":
        return <GastosList />;

      case "admin":
        return <AdminPanel />;

      case "perfil":
        return <PerfilPanel />;

      case "estadisticas":
        return <EstadisticasEmpresa periodo={periodo} />;

      case "inventario":
        return <Inventario />;

      case "productos":
        return <ProductosView />;

    default:
      return <h4>Selecciona una opción</h4>;
  }
}

export default ContentPanel;