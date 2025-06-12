function Alerta({ mensaje, tipo = "info", onClose }) {
  const estilos = {
    exito: "bg-green-100 text-green-800 border-green-400",
    error: "bg-red-100 text-red-800 border-red-400",
    info: "bg-gray-100 text-gray-800 border-gray-400",
  };

  const iconos = {
    exito: "✅",
    error: "❌",
    info: "ℹ️",
  };

  return (
    <div
      className={`relative flex items-start gap-2 px-4 py-3 rounded border shadow-md animate-fade-in ${estilos[tipo] || estilos.info}`}
    >
      <span className="text-xl">{iconos[tipo] || iconos.info}</span>
      <div className="flex-1 text-sm leading-snug">{mensaje}</div>

      {/* Botón cerrar */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-1 right-2 text-lg text-gray-600 hover:text-black"
          aria-label="Cerrar alerta"
        >
          ×
        </button>
      )}
    </div>
  );
}

export default Alerta;
