// src/components/GraficaVentas.js
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend
} from 'recharts';

function GraficaVentas({ datosGrafico = [], graficoRef, modo, setModo }) {

  return (
    <div className="bg-background-light p-4 rounded-lg shadow-md border border-border-color">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-text-light">Gráfica de Ventas</h2>
        <select value={modo} onChange={(e) => setModo(e.target.value)} className="bg-background-dark border border-border-color text-text-light p-1 rounded focus:ring-accent-start focus:border-accent-start">
          <option value="dia">Agrupar por día</option>
          <option value="semana">Agrupar por semana</option>
        </select>
      </div>

      {datosGrafico.length === 0 ? (
        <div className="flex items-center justify-center h-[300px]">
            <p className="text-text-subtle">No hay datos de ventas para mostrar.</p>
        </div>
      ) : (
        <div ref={graficoRef} className="bg-background-light">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={datosGrafico} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="fecha" tick={{ fill: 'var(--text-subtle)' }} />
              <YAxis tick={{ fill: 'var(--text-subtle)' }}/>
              <Tooltip 
                contentStyle={{ 
                    backgroundColor: 'var(--background-dark)', 
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-light)'
                }}
              />
              <Legend wrapperStyle={{ color: 'var(--text-subtle)' }}/>
              <Bar dataKey="total" name="Boletos vendidos" fill="url(#colorUv)" />
              <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="rgb(var(--color-accent-start))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="rgb(var(--color-accent-end))" stopOpacity={0.8}/>
                  </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default GraficaVentas;
