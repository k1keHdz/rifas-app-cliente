// src/components/BuscadorBoletos.js
import { useState } from 'react';

const BuscadorBoletos = ({
  totalBoletos,
  boletosOcupados,
  boletosSeleccionados,
  onSelectBoleto,
  // ==================================================================
  // INICIO DE CAMBIOS: Recibimos el padding dinámico como prop
  // ==================================================================
  paddingLength = 2 // Damos un valor por defecto seguro
  // ==================================================================
  // FIN DE CAMBIOS
  // ==================================================================
}) => {
  const [numero, setNumero] = useState('');
  const [estado, setEstado] = useState(null);

  const verificarNumero = (valor) => {
    if (valor === '') {
      setEstado(null);
      return;
    }
    const num = parseInt(valor, 10);
    // La lógica de la Lotería Nacional va de 0 a total-1
    if (isNaN(num) || num < 0 || num >= totalBoletos) {
      setEstado('no_existe');
    } else if (boletosOcupados.has(num)) {
      setEstado('comprado');
    } else {
      setEstado('disponible');
    }
  };

  const handleInput = (e) => {
    setNumero(e.target.value);
    verificarNumero(e.target.value);
  };

  const seleccionar = () => {
    const num = parseInt(numero, 10);
    if (estado === 'disponible' && !boletosSeleccionados.includes(num)) {
      onSelectBoleto(num);
      setNumero('');
      setEstado(null);
    }
  };

  const renderEstado = () => {
    if (estado === 'comprado') return <span className="text-red-600 font-bold">OCUPADO</span>;
    if (estado === 'disponible') return <span className="text-green-600 font-bold">DISPONIBLE</span>;
    if (estado === 'no_existe') return <span className="text-gray-500 font-semibold">No existe</span>;
    return null;
  };

  return (
    <div className="text-center mb-4 w-full max-w-xs">
      <h3 className="font-bold text-lg mb-2 text-center">Busca un Boleto Específico</h3>
      <input
        type="number"
        value={numero}
        onChange={handleInput}
        className="border px-3 py-2 rounded w-full text-center text-lg"
        placeholder={`Ej: ${String(Math.floor(Math.random() * totalBoletos)).padStart(paddingLength, '0')}`}
      />
      <div className="text-sm mt-1 h-5">Estado: {renderEstado()}</div>

      {estado === 'disponible' && !boletosSeleccionados.includes(parseInt(numero, 10)) && (
        <div className="mt-2 animate-fade-in">
          <button onClick={seleccionar} className="bg-green-600 hover:bg-green-700 text-white font-mono text-sm px-4 py-2 rounded-lg">
            {/* ================================================================== */}
            {/* INICIO DE CAMBIOS: Usamos el padding dinámico en el botón */}
            {/* ================================================================== */}
            + Agregar {numero.toString().padStart(paddingLength, '0')}
            {/* ================================================================== */}
            {/* FIN DE CAMBIOS */}
            {/* ================================================================== */}
          </button>
        </div>
      )}
    </div>
  );
};

export default BuscadorBoletos;