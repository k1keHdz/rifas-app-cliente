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
          // REPARACIÓN: Se usa la clase .input-field para consistencia.
          className="input-field p-1"
        />
      </div>
      <div className="flex flex-col">
        <label className="text-sm text-text-subtle mb-1">Hasta:</label>
        <input
          type="date"
          value={fechaHasta}
          onChange={(e) => setFechaHasta(e.target.value)}
          className="input-field p-1"
        />
      </div>
    </div>
  );
}

export default FiltroFechas;
