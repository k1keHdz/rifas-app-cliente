// src/components/FiltroFechas.js

function FiltroFechas({ fechaDesde, setFechaDesde, fechaHasta, setFechaHasta }) {
  return (
    <div className="flex gap-4 my-6 flex-wrap items-end">
      <div className="flex flex-col">
        <label className="text-sm text-text-subtle mb-1">Desde:</label>
        <input
          type="date"
          value={fechaDesde}
          onChange={(e) => setFechaDesde(e.target.value)}
          className="bg-background-dark text-text-light border border-border-color rounded-md p-1 focus:ring-accent-start focus:border-accent-start"
        />
      </div>
      <div className="flex flex-col">
        <label className="text-sm text-text-subtle mb-1">Hasta:</label>
        <input
          type="date"
          value={fechaHasta}
          onChange={(e) => setFechaHasta(e.target.value)}
          className="bg-background-dark text-text-light border border-border-color rounded-md p-1 focus:ring-accent-start focus:border-accent-start"
        />
      </div>
    </div>
  );
}

export default FiltroFechas;
