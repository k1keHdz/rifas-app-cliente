import { useState } from "react";

function useAlerta(duracion = 5000) {
  const [mensaje, setMensaje] = useState("");
  const [tipo, setTipo] = useState("info");

  const mostrarAlerta = (nuevoMensaje, tipoMensaje = "info") => {
    setMensaje(nuevoMensaje);
    setTipo(tipoMensaje);
    if (duracion > 0) {
      setTimeout(() => setMensaje(""), duracion);
    }
  };

  const cerrarAlerta = () => setMensaje("");

  return {
    mensaje,
    tipo,
    mostrarAlerta,
    cerrarAlerta,
  };
}

export default useAlerta;
