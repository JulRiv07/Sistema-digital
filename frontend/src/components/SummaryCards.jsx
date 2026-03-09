import "./SummaryCards.css";
import { useEffect, useState } from "react";
import { fmtCurrency } from "C:\Users\julia\Postres_Juli\frontend\src\services\format.js";
import axios from "axios";

function SummaryCards({ refreshKey }) {

  const [resumen, setResumen] = useState({
    vendido: 0,
    gastos: 0,
    pendiente: 0,
    ganancia: 0
  });

  useEffect(() => {
    axios.get("https://postres-juli.onrender.com/resumen")
      .then(res => {
        setResumen(res.data);
      })
      .catch(err => {
        console.error("Error cargando resumen:", err);
      });
  }, [refreshKey]);

  return (
    <section className="summary">
      <div className="card">
        Vendido mes actual: {fmtCurrency(resumen.vendido)}
      </div>
      <div className="card">
        Gastos mes actual: {fmtCurrency(resumen.gastos)}
      </div>
      <div className="card">
        Pendiente mes actual: {fmtCurrency(resumen.pendiente)}
      </div>
      <div className="card">
        Ganancia mes actual: {fmtCurrency(resumen.ganancia)}
      </div>
    </section>
  );
}


export default SummaryCards;
