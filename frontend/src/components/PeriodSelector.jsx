import "./PeriodSelector.css";

const MESES = Array.from({ length: 12 }, (_, i) =>
  new Date(2000, i, 1).toLocaleString("es-CO", { month: "long" })
);

function PeriodSelector({ periodo, setPeriodo }) {
  const anioActual = new Date().getFullYear();
  const anios = [];
  for (let a = 2024; a <= anioActual + 1; a++) anios.push(a);

  const cambiarMes = (delta) => {
    let mes = periodo.mes + delta;
    let año = periodo.año;
    if (mes < 1) {
      mes = 12;
      año -= 1;
    } else if (mes > 12) {
      mes = 1;
      año += 1;
    }
    setPeriodo({ mes, año });
  };

  return (
    <div className="periodo">
      <button
        className="periodo-arrow"
        onClick={() => cambiarMes(-1)}
        aria-label="Mes anterior"
      >
        ‹
      </button>

      <select
        className="periodo-select"
        value={periodo.mes}
        onChange={(e) => setPeriodo({ ...periodo, mes: Number(e.target.value) })}
      >
        {MESES.map((m, i) => (
          <option key={i + 1} value={i + 1}>
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </option>
        ))}
      </select>

      <select
        className="periodo-select"
        value={periodo.año}
        onChange={(e) => setPeriodo({ ...periodo, año: Number(e.target.value) })}
      >
        {anios.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>

      <button
        className="periodo-arrow"
        onClick={() => cambiarMes(1)}
        aria-label="Mes siguiente"
      >
        ›
      </button>
    </div>
  );
}

export default PeriodSelector;
