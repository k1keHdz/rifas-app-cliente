function FiltroFechas({ fechaDesde, setFechaDesde, fechaHasta, setFechaHasta }) {
  return (
    <div className="flex gap-4 mb-6 flex-wrap items-end">
      <div className="flex flex-col">
        <label className="text-sm text-gray-700">Desde:</label>
        <input
          type="date"
          value={fechaDesde}
          onChange={(e) => setFechaDesde(e.target.value)}
          className="border p-1 rounded"
        />
      </div>
      <div className="flex flex-col">
        <label className="text-sm text-gray-700">Hasta:</label>
        <input
          type="date"
          value={fechaHasta}
          onChange={(e) => setFechaHasta(e.target.value)}
          className="border p-1 rounded"
        />
      </div>
    </div>
  );
}

export default FiltroFechas;
