import { useState } from 'react';

const BuscadorBoletos = ({
  totalBoletos,
  boletosOcupados,
  boletosSeleccionados,
  onSelectBoleto,
}) => {
  const [numero, setNumero] = useState('');
  const [estado, setEstado] = useState(null);

  const verificarNumero = (valor) => {
    if (valor === '') {
      setEstado(null);
      return;
    }
    const num = parseInt(valor, 10);
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
    if (estado === 'comprado') return <span className="text-red-600 font-bold">COMPRADO</span>;
    if (estado === 'disponible') return <span className="text-green-600 font-bold">DISPONIBLE</span>;
    if (estado === 'no_existe') return <span className="text-gray-500 font-semibold">No existe</span>;
    return null;
  };

  return (
    <div className="text-center mb-4">
      <h3 className="font-bold text-lg mb-2 text-center">Elige tus boletos</h3>
      <p className="text-sm mb-1">Buscar número</p>
      <input
        type="number"
        value={numero}
        onChange={handleInput}
        className="border px-3 py-1 rounded w-32 text-center"
        placeholder="Ej: 123"
      />
      <div className="text-sm mt-1 h-5">Estado: {renderEstado()}</div>

      {estado === 'disponible' && !boletosSeleccionados.includes(parseInt(numero, 10)) && (
        <div className="mt-2">
          <button onClick={seleccionar} className="bg-green-600 hover:bg-green-700 text-white font-mono text-sm px-4 py-1 rounded">
            + Agregar {parseInt(numero, 10).toString().padStart(3, '0')}
          </button>
        </div>
      )}
    </div>
  );
};

export default BuscadorBoletos;