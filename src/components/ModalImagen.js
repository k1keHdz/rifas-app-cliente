// src/components/ModalImagen.js
import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ModalImagen({ imagenes = [], indexInicial = 0, onClose }) {
  const [index, setIndex] = useState(indexInicial);
  const [touchStartX, setTouchStartX] = useState(null);

  const imagenActual = imagenes[index];

  const cambiarImagen = (direccion) => {
    const total = imagenes.length;
    setIndex((prev) => (prev + direccion + total) % total);
  };

  const handleClickFondo = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        cambiarImagen(1); // izquierda
      } else {
        cambiarImagen(-1); // derecha
      }
    }
    setTouchStartX(null);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") cambiarImagen(-1);
      if (e.key === "ArrowRight") cambiarImagen(1);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!imagenActual) return null;

  return (
    <div
      onClick={handleClickFondo}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4"
    >
      {/* CAMBIO: Se añadió un ancho máximo generoso al contenedor de la imagen */}
      <div className="relative w-full max-w-4xl text-center">
        {/* Imagen principal */}
        <img
          src={imagenActual}
          alt="Vista ampliada"
          // CAMBIO: Se quita max-w-full para que el contenedor lo controle
          className="max-h-[85vh] rounded-lg shadow-2xl mx-auto"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        />

        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 text-white text-3xl bg-gray-800 bg-opacity-75 hover:bg-opacity-100 w-10 h-10 flex items-center justify-center rounded-full"
        >
          ✕
        </button>

        {/* Flechas SVG profesionales */}
        {imagenes.length > 1 && (
          <>
            {/* CAMBIO: Se ajusta la posición de las flechas para que estén sobre la imagen en los costados */}
            <button
              onClick={() => cambiarImagen(-1)}
              className="absolute top-1/2 left-2 md:-left-4 transform -translate-y-1/2 w-12 h-12 flex items-center justify-center text-white rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm transition shadow-lg"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button
              onClick={() => cambiarImagen(1)}
              className="absolute top-1/2 right-2 md:-right-4 transform -translate-y-1/2 w-12 h-12 flex items-center justify-center text-white rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm transition shadow-lg"
              aria-label="Siguiente"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </>
        )}

        {/* Miniaturas con scroll horizontal */}
        {imagenes.length > 1 && (
          <div className="mt-4 overflow-x-auto">
            <div className="flex justify-center gap-2 p-2 w-max mx-auto">
              {imagenes.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`Miniatura ${i + 1}`}
                  className={`w-16 h-16 object-cover rounded-md border-2 cursor-pointer transition ${
                    i === index
                      ? "border-white shadow-lg scale-110"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                  onClick={() => setIndex(i)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}