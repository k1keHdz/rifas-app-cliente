// --- src/components/modals/ModalMaquinaSuerte.js ---
import React, { useState, useCallback } from 'react';
import { formatTicketNumber } from '../../utils/rifaHelper';

function ModalMaquinaSuerte({ totalBoletos, boletosOcupados, boletosYaSeleccionados, onCerrar, onSeleccionar }) {
    const [cantidad, setCantidad] = useState(1);
    const [sugeridos, setSugeridos] = useState([]);
    const [error, setError] = useState('');

    const generarAleatorios = useCallback(() => {
        setError('');
        setSugeridos([]);
        
        const noDisponibles = new Set([...boletosOcupados.keys(), ...boletosYaSeleccionados]);
        
        const disponibles = [];
        for (let i = 0; i < totalBoletos; i++) {
            if (!noDisponibles.has(i)) {
                disponibles.push(i);
            }
        }

        if (disponibles.length < cantidad) {
            setError(`No hay suficientes boletos disponibles. Solo quedan ${disponibles.length}.`);
            return;
        }

        for (let i = disponibles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [disponibles[i], disponibles[j]] = [disponibles[j], disponibles[i]];
        }
        
        setSugeridos(disponibles.slice(0, cantidad));
    }, [cantidad, totalBoletos, boletosOcupados, boletosYaSeleccionados]);

    const opcionesCantidad = [1, 2, 3, 4, 5, 10, 15, 20, 25, 50];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onCerrar}>
            <div className="bg-background-light border border-border-color rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 text-center border-b border-border-color flex-shrink-0">
                    <button onClick={onCerrar} className="absolute top-3 right-3 text-text-subtle hover:opacity-75 text-2xl">&times;</button>
                    <span className='text-5xl'>🎰</span>
                    <h2 className="text-2xl font-bold text-center mt-2">Máquina de la Suerte</h2>
                    <p className='text-text-subtle mb-4 text-sm'>¿No sabes qué número elegir? ¡Deja que la suerte decida por ti!</p>
                </div>

                <div className="p-6 overflow-y-auto">
                    <label htmlFor="cantidad-suerte" className="block mb-1 font-semibold">¿Cuántos boletos quieres?</label>
                    <select 
                        id="cantidad-suerte"
                        className="input-field w-full mb-4" 
                        value={cantidad} 
                        onChange={(e) => setCantidad(Number(e.target.value))}
                    >
                        {opcionesCantidad.map(val => <option key={val} value={val}>{val} boleto{val > 1 ? 's' : ''}</option>)}
                    </select>
                    
                    {sugeridos.length > 0 && (
                        <div className='animate-fade-in mt-4'>
                            <p className='text-center mb-2 font-semibold'>¡Tus números de la suerte!</p>
                            <div className="flex flex-wrap gap-2 justify-center my-4 p-3 bg-background-dark rounded-lg border border-border-color">
                                {sugeridos.map((n) => (
                                    <span key={n} className="px-3 py-1 bg-success text-white rounded-md font-mono shadow-sm">{formatTicketNumber(n, totalBoletos)}</span>
                                ))}
                            </div>
                        </div>
                    )}
                    {error && <p className="mt-3 text-danger text-center text-sm font-semibold">{error}</p>}
                </div>

                <div className="p-6 border-t border-border-color mt-auto flex-shrink-0 space-y-4">
                    <button 
                        onClick={generarAleatorios} 
                        className="w-full btn btn-primary"
                    >
                        {sugeridos.length === 0 ? `🍀 ¡Generar ${cantidad} al Azar!` : "🎲 Generar Nuevos"}
                    </button>
                    {sugeridos.length > 0 && (
                           <button onClick={() => onSeleccionar(sugeridos)} className="btn bg-success hover:bg-green-700 text-white w-full text-lg">
                                ✅ Agregar a mi Selección
                           </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ModalMaquinaSuerte;