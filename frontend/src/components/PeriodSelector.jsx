import "./PeriodSelector.css";

const MESES = Array.from({ length: 12 }, (_, i) =>
  new Date(2000, i, 1).toLocaleString("es-CO", { month: "long" })
);

function PeriodSelector({ periodo, setPeriodo }) {
  const anioActual = new Date().getFullYear();
  const anios = [];
  for (let a = 2024; a <= anioActual + 1; a++) anios.push(a);

  return (
    <div className="periodo">
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
    </div>
  );
}

export default PeriodSelector;
