// src/components/Alerta.js
function Alerta({ mensaje, tipo = "info", onClose }) {
  // --- INICIO DE MEJORA: Paleta de colores para tema oscuro ---
  const estilos = {
    exito: "bg-success/10 text-green-300 border-success/30",
    error: "bg-danger/10 text-red-300 border-danger/30",
    info: "bg-background-light text-text-subtle border-border-color",
  };

  const iconos = {
    exito: "✅",
    error: "❌",
    info: "ℹ️",
  };
  // --- FIN DE MEJORA ---

  return (
    <div
      className={`relative flex items-start gap-3 px-4 py-3 rounded-lg border shadow-md animate-fade-in ${estilos[tipo] || estilos.info}`}
    >
      <span className="text-xl mt-0.5">{iconos[tipo] || iconos.info}</span>
      <div className="flex-1 text-sm leading-snug">{mensaje}</div>

      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-1 right-1 text-lg text-text-subtle hover:text-text-light p-1"
          aria-label="Cerrar alerta"
        >
          &times;
        </button>
      )}
    </div>
  );
}

export default Alerta;
