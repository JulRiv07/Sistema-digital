import { useEffect, useState } from "react";
import axios from "axios";
import { fmtCurrency, fmtNumber } from "../services/format";
import Estadisticas from "./Estadisticas";
import "./EstadisticasEmpresa.css";

function GraficaBarras({ datos, formato }) {
  const max = Math.max(1, ...datos.map((d) => d.valor));
  if (datos.length === 0) return <p className="ge-vacio">Sin datos todavía.</p>;

  return (
    <div className="ge-grafica">
      {datos.map((d, i) => (
        <div className="ge-fila" key={i}>
          <span className="ge-label">{d.label}</span>
          <div className="ge-barra-bg">
            <div
              className="ge-barra"
              style={{ width: `${(d.valor / max) * 100}%` }}
            />
          </div>
          <span className="ge-valor">{formato ? formato(d.valor) : fmtNumber(d.valor)}</span>
        </div>
      ))}
    </div>
  );
}

function rolLabel(rol) {
  return rol === "admin" ? "Empresario" : "Empleado";
}

function EstadisticasEmpresa({ periodo }) {
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const params = periodo ? `?mes=${periodo.mes}&anio=${periodo.año}` : "";
    setCargando(true);
    axios
      .get(`/empresa/estadisticas${params}`)
      .then((r) => setDatos(r.data))
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [periodo]);

  const ventasData = datos.map((d) => ({ label: d.nombre, valor: d.ventas_total }));
  const pagosData = datos.map((d) => ({ label: d.nombre, valor: d.pagos_total }));

  if (cargando) {
    return <div className="ge-panel"><p className="ge-vacio">Cargando…</p></div>;
  }

  return (
    <div className="ge-panel">
      <h2 className="ge-title">Estadísticas del equipo</h2>

      <section className="ge-card">
        <h3>Ventas por persona</h3>
        <GraficaBarras datos={ventasData} formato={fmtCurrency} />
      </section>

      <section className="ge-card">
        <h3>Pagos recaudados por persona</h3>
        <GraficaBarras datos={pagosData} formato={fmtCurrency} />
      </section>

      <section className="ge-card">
        <h3>Detalle por persona</h3>
        {datos.map((d) => (
          <div key={d.id} className="ge-persona">
            <div className="ge-persona-head">
              <span className="ge-persona-nombre">{d.nombre}</span>
              <span className={`ge-rol ge-rol-${d.rol}`}>{rolLabel(d.rol)}</span>
            </div>
            <Estadisticas stats={d} />
          </div>
        ))}
      </section>
    </div>
  );
}

export default EstadisticasEmpresa;
