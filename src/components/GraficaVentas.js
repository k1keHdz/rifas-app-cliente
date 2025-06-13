// src/components/GraficaVentas.js
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend
} from 'recharts';

// ==================================================================
// INICIO DE CORRECCIÓN: Añadimos un valor por defecto a datosGrafico
// ==================================================================
function GraficaVentas({ datosGrafico = [], graficoRef, modo, setModo }) {
// ==================================================================
// FIN DE CORRECCIÓN
// ==================================================================

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Gráfica de Ventas</h2>
        <select value={modo} onChange={(e) => setModo(e.target.value)} className="border p-1 rounded">
          <option value="dia">Agrupar por día</option>
          <option value="semana">Agrupar por semana</option>
        </select>
      </div>

      {datosGrafico.length === 0 ? (
        <div className="flex items-center justify-center h-[300px]">
            <p className="text-gray-500">No hay datos de ventas para mostrar.</p>
        </div>
      ) : (
        <div ref={graficoRef}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={datosGrafico} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" name="Boletos vendidos" fill="#38bdf8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default GraficaVentas;