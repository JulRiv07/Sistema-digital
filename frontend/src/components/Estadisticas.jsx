import { fmtCurrency, fmtNumber } from "../services/format";
import "./Estadisticas.css";

function Estadisticas({ stats }) {
  if (!stats) return <p className="stats-cargando">Cargando…</p>;

  return (
    <div className="stats-grid">
      <div className="stats-card">
        <span className="stats-label">Ventas</span>
        <span className="stats-num">{fmtNumber(stats.ventas_count)}</span>
        <span className="stats-sub">{fmtCurrency(stats.ventas_total)}</span>
      </div>
      <div className="stats-card">
        <span className="stats-label">Pagos</span>
        <span className="stats-num">{fmtNumber(stats.pagos_count)}</span>
        <span className="stats-sub">{fmtCurrency(stats.pagos_total)}</span>
      </div>
      <div className="stats-card">
        <span className="stats-label">Gastos</span>
        <span className="stats-num">{fmtNumber(stats.gastos_count)}</span>
        <span className="stats-sub">{fmtCurrency(stats.gastos_total)}</span>
      </div>
      <div className="stats-card">
        <span className="stats-label">Clientes</span>
        <span className="stats-num">{fmtNumber(stats.clientes_count)}</span>
        <span className="stats-sub">registrados</span>
      </div>
    </div>
  );
}

export default Estadisticas;
