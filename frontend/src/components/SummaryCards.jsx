import "./SummaryCards.css";
import { useEffect, useState } from "react";
import { fmtCurrency } from "../services/format";
import axios from "axios";

function SummaryCards({ periodo }) {

  const [resumen, setResumen] = useState({
    vendido: 0,
    gastos: 0,
    pendiente: 0,
    ganancia: 0
  });

  useEffect(() => {
    const params = periodo ? `?mes=${periodo.mes}&anio=${periodo.año}` : "";
    axios.get(`/resumen${params}`)
      .then(res => {
        setResumen(res.data);
      })
      .catch(err => {
        console.error("Error cargando resumen:", err);
      });
  }, [periodo]);

  return (
    <section className="summary">
      <div className="card">
        Vendido: {fmtCurrency(resumen.vendido)}
      </div>
      {resumen.gastos != null && (
        <div className="card">
          Gastos: {fmtCurrency(resumen.gastos)}
        </div>
      )}
      <div className="card">
        Pendiente: {fmtCurrency(resumen.pendiente)}
      </div>
      {resumen.ganancia != null && (
        <div className="card">
          Ganancia: {fmtCurrency(resumen.ganancia)}
        </div>
      )}
    </section>
  );
}


export default SummaryCards;
