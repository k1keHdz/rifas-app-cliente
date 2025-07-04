// src/components/ui/Alerta.js

function Alerta({ mensaje, tipo = "info", onClose }) {
    const estilos = {
        exito: "bg-success/10 text-success border-success/30",
        error: "bg-danger/10 text-danger border-danger/30",
        info: "bg-background-light text-text-primary border-border-color",
    };

    const iconos = {
        exito: "✅",
        error: "❌",
        info: "ℹ️",
    };

    return (
        <div
            className={`relative flex items-start gap-3 px-4 py-3 rounded-lg border shadow-md animate-fade-in ${estilos[tipo] || estilos.info}`}
        >
            <span className="text-xl mt-0.5">{iconos[tipo] || iconos.info}</span>
            {/* Este div ahora puede renderizar texto simple o componentes JSX complejos */}
            <div className="flex-1 text-sm leading-snug">{mensaje}</div>

            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-1 right-1 text-lg p-1 opacity-70 hover:opacity-100"
                    aria-label="Cerrar alerta"
                >
                    &times;
                </button>
            )}
        </div>
    );
}

export default Alerta;
