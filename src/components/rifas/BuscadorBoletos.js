// --- src/components/rifas/BuscadorBoletos.js ---
import { useState } from 'react';
import { formatTicketNumber } from '../../utils/rifaHelper';

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
        if (estado === 'comprado') return <span className="text-danger font-bold">NO DISPONIBLE</span>;
        if (estado === 'disponible') return <span className="text-success font-bold">DISPONIBLE</span>;
        if (estado === 'no_existe') return <span className="text-text-subtle font-semibold">No existe</span>;
        return null;
    };

    return (
        <div className="text-center mb-4 w-full max-w-xs">
            <h3 className="font-bold text-lg mb-2 text-center">Busca un Boleto Específico</h3>
            <input
                type="number"
                value={numero}
                onChange={handleInput}
                className="input-field w-full text-center text-lg"
                placeholder={`Ej: ${formatTicketNumber(Math.floor(Math.random() * totalBoletos), totalBoletos)}`}
            />
            <div className="text-sm mt-1 h-5 text-text-subtle">Estado: {renderEstado()}</div>

            {estado === 'disponible' && !boletosSeleccionados.includes(parseInt(numero, 10)) && (
                <div className="mt-2 animate-fade-in">
                    <button onClick={seleccionar} className="btn bg-success text-white font-mono text-sm py-2">
                        Añadir {formatTicketNumber(numero, totalBoletos)}
                    </button>
                </div>
            )}
        </div>
    );
};

export default BuscadorBoletos;