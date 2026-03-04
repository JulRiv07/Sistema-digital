import "./SummaryCards.css";
import { useEffect, useState } from "react";
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
        Vendido mes actual: $ {resumen.vendido}
      </div>

      <div className="card">
        Gastos mes actual: $ {resumen.gastos}
      </div>

      <div className="card">
        Pendiente mes actual: $ {resumen.pendiente}
      </div>

      <div className="card">
        Ganancia mes actual: $ {resumen.ganancia}
      </div>
    </section>
  );
}

export default SummaryCards;